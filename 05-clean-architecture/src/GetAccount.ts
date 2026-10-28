import type IAccountRepository from "./AccountRepository.ts";
import type IUserCase from "./IUserCase.ts";

export class GetAccount implements IUserCase {
    constructor(
        readonly accountRepository: IAccountRepository,
    ) { }


    async Execute(accountId: string): Promise<Output> {
        const account = await this.accountRepository.GetById(accountId);
        const output = {
            accountId: account.accountId,
            name: account.GetName(),
            email: account.email,
            document: account.document,
            password: account.password,
            balances: account.balances.map(balance => ({
                assetId: balance.assetId,
                quantity: balance.quantity
            }))
        }
        return output;
    }
}

type Output = {
    accountId: string;
    name: string;
    email: string;
    document: string;
    password: string;
    balances: {
        assetId: string;
        quantity: number;
    }[];
}