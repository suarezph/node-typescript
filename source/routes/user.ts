import express, { NextFunction, Request, Response } from 'express';
import controller from '../controllers/user';
import extractJWT from '../middleware/extractJWT';
import { validate, IsNotEmpty, IsEmail } from 'class-vali dator';
import { plainToClass, Expose } from 'class-transformer';

const router = express.Router();

class UserDto {
    @IsNotEmpty({
        message: 'FullName is required'
    })
    fullname: string = '';

    @IsNotEmpty({
        message: 'Email is required'
    })
    @IsEmail()
    email: string = '';

    @IsNotEmpty({
        message: 'Password is required'
    })
    password: string = '';
}

const validationMw = (dtoClass: any) => {
    return function (req: Request, res: Response, next: NextFunction) {
        const output: any = plainToClass(dtoClass, req.body);
        validate(output, { skipMissingProperties: true }).then((errors) => {
            if (errors.length > 0) {
                let errorTexts = Array();
                for (const errorItem of errors) {
                    errorTexts = [...errorTexts, { [errorItem.property]: errorItem.constraints }];
                }
                res.status(400).send(errorTexts);
                return;
            } else {
                res.locals.input = output;
                next();
            }
        });
    };
};

router.get('/validate', extractJWT, controller.validateToken);
router.post('/register', validationMw(UserDto), controller.register);
router.post('/login', controller.login);
router.get('/get/all', controller.getAllUsers);

export = router;
