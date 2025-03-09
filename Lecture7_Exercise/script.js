let display = document.getElementById("display");

let baseValue = null;
let exponentMode = false;

function appendToDisplay(value){
    display.value += value ?? "";
}

function clearDisplay(){
    display.value = "";
    baseValue = null;
    exponentMode = false;
}

function calculateResult(){
    try {
        if (exponentMode){
            let exponent = parseFloat(display.value) ?? 1;
            let powerFunction = exponentiation(exponent);
            display.value = powerFunction(baseValue);
            exponentMode = false;
            baseValue = null;
            return;
        }

        if (!display.value.trim()){
            throw new Error("No input provided!");
        }
        
        if (display.value.includes("/0")) {
            throw new Error("Cannot divide by zero!");
        }
        
        let result = eval(display.value) ?? "Error";
        display.value = result;
    } catch (error) {
        display.value = error.message;
    }
}

const exponentiation = (exp) => {
    return (base) => {
        return base ** exp;
    };
};

function usePowerFunction() {
    if (display.value.trim() === "") return;

    baseValue = parseFloat(display.value) ?? 0;
    exponentMode = true;
    display.value = "";
}
