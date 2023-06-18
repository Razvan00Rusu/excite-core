const z = require("zod");

const INFERENCE_REQUEST = z
  .object({
    data: z.object({
      contexts: z.array(
        z.object({
          context: z.string(),
        })
      ),
    }),
  })
  .default({
    data: {
      contexts: [],
    },
  });

module.exports = INFERENCE_REQUEST;
