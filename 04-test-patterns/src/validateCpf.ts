const VALID_CPF_LENGTH = 11;
const WEIGHT_FIRST_DIGIT = 10;
const WEIGHT_SECOND_DIGIT = 11;

export function ValidateCpf (cpf: string) {
	if (!cpf) return false;
	cpf = RemoveNonDigits(cpf);
	if (cpf.length !== VALID_CPF_LENGTH) return false;
	if (AreAllDigitsTheSame(cpf)) return false;
	const digit1 = CalculateDigit(cpf, WEIGHT_FIRST_DIGIT);
	const digit2 = CalculateDigit(cpf, WEIGHT_SECOND_DIGIT);
	let checkDigit = ExtractCheckDigit(cpf); 
	return checkDigit == `${digit1}${digit2}`;
}

function RemoveNonDigits (cpf: string) {
	return cpf.replace(/\D/g,'');
}

function AreAllDigitsTheSame (cpf: string) {
	const [firstDigit] = cpf;
  	return [...cpf].every((digit: string) => digit === firstDigit);
}

function CalculateDigit (cpf: string, weight: number) {
	let sum = 0;
	for (const digit of cpf) {
		if (weight < 2) break;
		sum += parseInt(digit) * weight;
		weight--;
	}
	const remainder = sum%11;
	return (remainder < 2) ? 0 : 11 - remainder;
}

function ExtractCheckDigit (cpf: string) {
	return cpf.slice(9);
}