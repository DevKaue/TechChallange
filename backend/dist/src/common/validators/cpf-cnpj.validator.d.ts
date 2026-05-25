import { ValidationOptions, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';
export declare class IsValidCpfCnpjConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments): boolean;
    defaultMessage(args: ValidationArguments): string;
}
export declare function IsCpfOrCnpj(validationOptions?: ValidationOptions): (object: Object, propertyName: string) => void;
