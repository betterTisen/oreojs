/**
 * @author byeguo
 * @desc 用于定义变量、限制const 重复赋值
 */

class SimpleValue {
  constructor(value, kind = "") {
    this.value = value
    this.kind = kind
  }

  set(value) {
    // 禁止重新对const类型变量赋值
    if (this.kind === "const") {
      throw new TypeError("Assignment to constant variable")
    } else {
      this.value = value
    }
  }

  get() {
    return this.value
  }
}

export default SimpleValue
