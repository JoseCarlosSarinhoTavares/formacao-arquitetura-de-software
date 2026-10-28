import { ValidateCpf } from "./ValidateCpf.ts";
import { ValidateEmail } from "./ValidateEmail.ts";
import { ValidateName } from "./ValidateName.ts";
import { ValidatePassword } from "./ValidatePassword.ts";

export default class Account {
    constructor(readonly accountId: string, private name: string, readonly email: string, readonly document: string, readonly password: string, readonly balances: Balance[]) {
        if (!ValidateName(name)) throw new Error("Invalid name");
        if (!ValidateEmail(email)) throw new Error("Invalid email");
        if (!ValidateCpf(document)) throw new Error("Invalid document");
        if (!ValidatePassword(password)) throw new Error("Invalid password");
    }

    static Create(name: string, email: string, document: string, password: string): Account {
        const accountId = crypto.randomUUID();
        const balances: Balance[] = [];
        return new Account(accountId, name, email, document, password, balances);
    }

    Deposit(assetId: string, quantity: number) {
        const balance = this.balances.find((balance) => balance?.assetId === assetId);
        if (balance) {
            balance.quantity += quantity;
        } else {
            this.balances.push({ assetId, quantity });
        }
    }

    Withdraw(assetId: string, quantity: number) {
        const balance = this.balances.find((balance) => balance?.assetId === assetId);
        if (!balance || balance.quantity < quantity) {
            throw new Error("Insufficient balance");
        }
        balance.quantity -= quantity;
    }

    GetBalances(assetId: string): number {
        const balance = this.balances.find(b => b.assetId === assetId);
        return balance ? balance.quantity : 0;
    }

    SetName(name: string) {
        if (!ValidateName(name)) throw new Error("Invalid name");
        this.name = name;
    }

    GetName(): string {
        return this.name;
    }
}

export type Balance = {
    assetId: string;
    quantity: number
};
