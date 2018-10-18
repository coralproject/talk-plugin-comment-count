import { RequestHandler, Router, Request, Response } from "express";
import path from "path";
import * as nunjucks from "nunjucks";
import ms from "ms";

/**
 * TalkRequest adds the Talk context into the Express Request type.
 */
interface TalkRequest extends Request {
  context: any;
}

// Setup the nunjucks environment.
const env = new nunjucks.Environment(
  new nunjucks.FileSystemLoader(path.join(__dirname, "templates")),
  {
    watch: process.env.NODE_ENV === "development"
  }
);

const config = {
  COUNT_CACHE_DURATION: Math.floor(
    ms(process.env.TALK_COMMENT_COUNT_CACHE_DURATION || "2m") / 1000
  ),
  DETECT_CACHE_DURATION: Math.floor(
    ms(process.env.TALK_COMMENT_DETECT_COUNT_CACHE_DURATION || "1h") / 1000
  )
};

function addHeaders(res: Response, expiry: number) {
  res.setHeader("Cache-Control", `public, max-age=${expiry}`);
  res.setHeader("Content-Type", "text/javascript");
}

const cacheHandler: RequestHandler = async (req: TalkRequest, res) => {
  // Extract the Asset URL/ID from the query params.
  const {
    id,
    url,
    ds: commentCountSelectorRef
  }: Record<string, string | undefined> = req.query;

  // Extract the disableCommentText parameter.
  const disableCommentText: boolean = typeof req.query.notext !== "undefined";

  // Extract the CSS selector from the query parameters.
  let commentCountSelector: string =
    req.query.selector || ".talk_comment_count";

  // If the URl and the ID aren't provided, we need to serve the detect script.
  if (!url && !id) {
    // Send back the headers.
    addHeaders(res, config.DETECT_CACHE_DURATION);

    // Send the compiled template back.
    res.send(
      env.render("detect.js", {
        commentCountSelector,
        disableCommentText,
        ...res.locals
      })
    );
    return;
  }

  // Try to load the comments.
  let commentCount = 0;
  try {
    // Grab a reference to the graph context, and create a new fresh Context to
    // utilize the loaders.
    const graph = req.context.connectors.graph;
    const ctx = graph.Context.forSystem();

    if (id) {
      // Load the comment counts via the asset ID that was passed.
      commentCount = await ctx.loaders.Comments.countByAssetID.load(id);
    } else {
      // Load the asset via the URL passed.
      let asset = await ctx.loaders.Assets.findByUrl(url!);

      // If the asset is found, get the comment count for it.
      if (asset) {
        commentCount = await ctx.loaders.Comments.countByAssetID.load(asset.id);
      }
    }
  } catch (err) {
    // Looks like an error occurred, it's possible that the Asset does not
    // exist.
  }

  // Grab the translation framework out of the request.
  const translate = res.locals.t;

  // Get a version of the commentCountText that we can use on the template.
  let commentCountText: string;
  if (disableCommentText) {
    commentCountText = `${commentCount}`;
  } else if (commentCount === 1) {
    commentCountText = `${commentCount} ${translate("comment_singular")}`;
  } else {
    commentCountText = `${commentCount} ${translate("comment_plural")}`;
  }

  // Send back the headers.
  addHeaders(res, config.COUNT_CACHE_DURATION);

  // Send the compiled template back.
  return res.send(
    env.render("count.js", {
      commentCountSelector,
      commentCountSelectorRef,
      commentCountText,
      ...res.locals
    })
  );
};

export const router = (router: Router) => {
  router.get("/static/embed/count.js", cacheHandler);
};
