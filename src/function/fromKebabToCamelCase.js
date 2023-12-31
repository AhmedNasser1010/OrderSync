const fromKebabToCamelCase = (kebabText) => {

    let kebabTextSplit = kebabText.split("-");

    if (kebabText) {
        kebabTextSplit = kebabTextSplit.map((text, index) => {
            return index === 0 ? text : text[0].toUpperCase() + text.slice(1)
        })
    }

    return kebabTextSplit.join("");
}

export default fromKebabToCamelCase;