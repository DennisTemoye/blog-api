const express = require("express");
const router = express.Router();
const courses = [
  {
    id: 1,
    name: "Course 1",
  },
  {
    id: 2,
    name: "Course 2",
  },
  {
    id: 3,
    name: "Course 3",
  },
];
router.get("/", (req, res) => {
  res.send(courses);
});

router.get("/:id", (req, res) => {
  const courseId = req.params.id;
  const course = courses.find((c) => c.id === parseInt(courseId));
  if (!course)
    res.status(404).send(`The course with id ${courseId}, is not available`);
  res.send(course);
});

//POST REQUESTS
router.post("/", (req, res) => {
  const { error } = validateCourse(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const course = {
    id: courses.length + 1,
    name: req.body.name,
  };
  courses.push(course);
  res.send(course);
});

//UPDATES REQUEST
router.put("/:id", (req, res) => {
  const courseId = req.params.id;
  const course = courses.find((c) => c.id === parseInt(courseId));
  if (!course)
    return res
      .status(404)
      .send(`The course with id ${courseId}, is not available`);
  const { error } = validateCourse(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  course.name = req.body.name;
  res.send(course);
});

//DELETE REQUEST
router.delete("/:id", (req, res) => {
  const courseId = req.params.id;
  const course = courses.find((c) => c.id === parseInt(courseId));
  if (!course)
    return res
      .status(404)
      .send(`The course with id ${courseId}, is not available`);

  const index = courses.indexOf(course);
  courses.splice(index, 1);

  res.send(course);
});

function validateCourse(course) {
  const schema = {
    name: Joi.string().min(3).required(),
  };
  return Joi.validate(course, schema);
}

module.exports = router;
