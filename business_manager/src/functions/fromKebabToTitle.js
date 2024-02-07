const fromKebabToTitle = (kebabText) => {

    let kebabTextSplit = kebabText.split("-");

    if (kebabText) {
        kebabTextSplit = kebabTextSplit.map(text => text[0].toUpperCase() + text.slice(1))
    }

    return kebabTextSplit.join(" ");
}

export default fromKebabToTitle;