import Oreojs from "./src"
// import Oreojs from "./canjs"

new Oreojs(`
const a=2,b=a
  console.log(b)
`).run()
