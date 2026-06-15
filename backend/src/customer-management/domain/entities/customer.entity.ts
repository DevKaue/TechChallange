import Document from '@customer-management/domain/value-objects/document.vo';

export class Customer {
    private _id: string;
    private _document: Document;
    private _name: string;
    private _surname: string;

    constructor(id: string, document: Document, name: string, surname: string) {
        this._id = id;
        this._document = document;
        this._name = name;
        this._surname = surname;
    }

    // Getters
    public get id(): string {
        return this._id;
    }

    public get document(): Document {
        return this._document;
    }

    public get name(): string {
        return this._name;
    }

    public get surname(): string {
        return this._surname;
    }
}