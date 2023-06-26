const z = require("zod");

const INFERENCE_REQUEST = z
  .object({
    inference: z.array(z.object({
      context: z.string()
    })),
  })
  .default({
    inference: []
  });

module.exports = INFERENCE_REQUEST;
