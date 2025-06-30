const Joi = require("joi");

function validatePost(post) {
  const schema = Joi.object({
    title: Joi.string().min(3).max(255).required(),
    content: Joi.string().min(10).max(65535).required(),
    author: Joi.string().min(2).max(255).required(),
    status: Joi.string()
      .valid("draft", "published", "archived")
      .default("draft"),
  });
  return schema.validate(post);
}

function validateUser(user, isUpdate = false) {
  const baseSchema = {
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email().max(255).required(),
    first_name: Joi.string().max(100).optional(),
    last_name: Joi.string().max(100).optional(),
    role: Joi.string().valid("admin", "user", "moderator").default("user"),
    is_active: Joi.boolean().default(true),
  };

  // Add password validation only for new user creation
  if (!isUpdate) {
    baseSchema.password = Joi.string().min(6).max(255).required();
  }

  const schema = Joi.object(baseSchema);
  return schema.validate(user);
}

module.exports = { validatePost, validateUser };
