import { body, check, validationResult } from 'express-validator';
import { object, string, number, date, InferType } from 'yup';

// const validateSchools = async(req, res, next) => {

//   console.log(req.body)
  
//   const { schoolName, schoolEmail, phoneNumber, country, contactPerson,
//     contactPersonPhoneNumber, address, subDomain, state } = req.body;

//     console.log(schoolName)

//  let schema = Joi.object({

//     schoolName: Joi.string().required(),
//     schoolEmail: Joi.string().required(),
//     country: Joi.string().required(),
//     contactPersonPhoneNumber: Joi.string().required(),
//     address: Joi.string().required(),
//     subDomain: Joi.string().required(),
//     state: Joi.string().required(),
//     logo: Joi.required(),
  
//   });
//   const {
//     error
//   } = schema.Joi.validate(req.body);
//   if (error) {
//     res.status(422)
//       .send(error.details[0].message);
//   } else {
//     next();
//   }
// };



export const linkSchema = yup.object({
  body: yup.object({
    schoolName: yup.string().required(),
    schoolEmail: yup.string().required(),
    country: yup.string().required(),
    contactPersonPhoneNumber: yup.string().required(),
    address: yup.string().required(),
    subDomain: yup.string().required(),
    state: yup.string().required(),
    logo: yup.required(),
  }),
  // params: yup.object({
  //   id: yup.number().required(),
  // }),
});

const validate = (schema) => async (req, res, next) => {
  try {
    await schema.validate({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (err) {
    return res.status(500).json({ type: err.name, message: err.message });
  }
};
module.exports= {
  validate
}
// export default validateSchools;
