const crypto = require("crypto")

const Key1 = crypto.randomBytes(32).toString("hex")
const Key2 = crypto.randomBytes(32).toString("hex")
console.table({Key1, Key2});