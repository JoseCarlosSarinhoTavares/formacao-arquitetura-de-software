import type IAccountRepository from "./AccountRepository.ts";
import Account from "./Account.ts";
import type IUserCase from "./IUserCase.ts";

export class Signup implements IUserCase {
    constructor(
        readonly accountRepository: IAccountRepository
    ) { }

    async Execute(input: Input): Promise<Output> {
        const account = Account.Create(input.name, input.email, input.document, input.password);
        await this.accountRepository.Save(account);
        return {
            accountId: account.accountId
        };
    }
}

type Input = {
    name: string;
    email: string;
    document: string;
    password: string;
}

type Output = {
    accountId: string;
}