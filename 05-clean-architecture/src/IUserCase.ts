export default interface IUserCase {
    Execute(input: Input): Promise<Output | void>;
}

type Input = { }
type Output = { }