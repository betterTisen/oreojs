import Oreojs from "./src"

const str1 = `
  console.log(1+2)
`

const str2 = `let a = 2
function f() {
  for (let i = 1; i <= 3; i++) {
    a = a + 1
    console.log("for:"+i)
    if(i===2){
      return a
    }
  }
}
console.log("end:"+f())`

const str3 = `
function obj(v){
  this[a] = v
}
const o1 = new obj("o1o1")
const o2 = new obj("o2o2")
console.log(o1.a)
console.log(o2.a)
o1.a = 3
console.log(o1.a)
console.log(o2.a)
`

new Oreojs(str3).run()
