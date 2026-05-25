"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidCpfCnpjConstraint = void 0;
exports.IsCpfOrCnpj = IsCpfOrCnpj;
const class_validator_1 = require("class-validator");
function isValidCpf(cpf) {
    const clean = cpf.replace(/\D/g, '');
    if (clean.length !== 11)
        return false;
    if (/^(\d)\1{10}$/.test(clean))
        return false;
    let sum = 0;
    let remainder;
    for (let i = 1; i <= 9; i++) {
        sum += parseInt(clean.substring(i - 1, i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(clean.substring(9, 10)))
        return false;
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(clean.substring(i - 1, i)) * (12 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11)
        remainder = 0;
    if (remainder !== parseInt(clean.substring(10, 11)))
        return false;
    return true;
}
function isValidCnpj(cnpj) {
    const clean = cnpj.replace(/\D/g, '');
    if (clean.length !== 14)
        return false;
    if (/^(\d)\1{13}$/.test(clean))
        return false;
    let length = clean.length - 2;
    let numbers = clean.substring(0, length);
    const digits = clean.substring(length);
    let sum = 0;
    let pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2)
            pos = 9;
    }
    let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(0)))
        return false;
    length = length + 1;
    numbers = clean.substring(0, length);
    sum = 0;
    pos = length - 7;
    for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2)
            pos = 9;
    }
    result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (result !== parseInt(digits.charAt(1)))
        return false;
    return true;
}
let IsValidCpfCnpjConstraint = class IsValidCpfCnpjConstraint {
    validate(value, args) {
        if (typeof value !== 'string')
            return false;
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length === 11) {
            return isValidCpf(cleanValue);
        }
        else if (cleanValue.length === 14) {
            return isValidCnpj(cleanValue);
        }
        return false;
    }
    defaultMessage(args) {
        return 'O campo CPF/CNPJ deve ser um documento válido no formato brasileiro (CPF ou CNPJ).';
    }
};
exports.IsValidCpfCnpjConstraint = IsValidCpfCnpjConstraint;
exports.IsValidCpfCnpjConstraint = IsValidCpfCnpjConstraint = __decorate([
    (0, class_validator_1.ValidatorConstraint)({ name: 'isValidCpfCnpj', async: false })
], IsValidCpfCnpjConstraint);
function IsCpfOrCnpj(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isCpfOrCnpj',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: IsValidCpfCnpjConstraint,
        });
    };
}
//# sourceMappingURL=cpf-cnpj.validator.js.map