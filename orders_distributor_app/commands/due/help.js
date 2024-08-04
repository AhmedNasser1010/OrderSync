const help = () => {
console.log(`
Due Commands:
due -? RIDER_ID        : Display current rider orders dues
due RIDER_ID           : Reset rider dues to zero
due RIDER_ID MINUS_NUM : Decrease rider orders dues by a number
`)
}

module.exports = help