import LicensePlate from '@customer-management/domain/value-objects/license-plate.vo';

export type VehicleProps = {
    id: string;
    licensePlate: LicensePlate;
    brand: string;
    model: string;
    year: number;
    createdAt?: Date;
    updatedAt?: Date;
};

export class Vehicle {
    private _licensePlate: LicensePlate;
    private _brand: string;
    private _model: string;
    private _year: number;
    private _createdAt: Date;
    private _updatedAt: Date;

    constructor({ licensePlate, brand, model, year, createdAt, updatedAt }: VehicleProps)  {
        this._licensePlate = licensePlate;
        this._brand = brand;
        this._model = model;
        this._year = year;
        this._createdAt = createdAt ?? new Date();
        this._updatedAt = updatedAt ?? new Date();
    }

    // Getters
    public get licensePlate(): string {
        return this._licensePlate.value;
    }

    public get brand(): string {
        return this._brand;
    }

    public get model(): string {
        return this._model;
    }

    public get year(): number {
        return this._year;
    }

    public get createdAt(): Date {
        return this._createdAt;
    }

    public get updatedAt(): Date {
        return this._updatedAt;
    }
}