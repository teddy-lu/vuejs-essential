// 具体的验证逻辑
function validate(el, modifiers, bindingValue){
  bindingValue = bindingValue && typeof bindingValue === 'object' ? bindingValue : {}
  const value = typeof el.value === 'string' ? el.value.trim() : ''
  const { title = '该项', error } = bindingValue
  let defaultError = ''

  if (modifiers.required && value === '') {
    defaultError = `${title}不能为空`
  } else if (bindingValue.target) {
    const target = document.querySelector(bindingValue.target)
    const targetValue = target ? target.value : null

    if (targetValue !== value) {
      defaultError = `输入的${title}不匹配`
    }
  } else if (bindingValue.regex) {
    try {
      if (!bindingValue.regex.test(value)) {
        defaultError = `${title}格式不正确`
      }
    } catch (e) {}
  }

  if (defaultError) {
    if (error === undefined) {
      showError(el, defaultError)
    } else {
      showError(el, error)
    }
  } else {
    showError(el)
  }
}

// 显示或隐藏错误提示元素
function showError(el, error) {
  const parentElement = el.parentElement
  const errorElement = getErrorElement(el)

  if (error === undefined) {
    errorElement.style.display = 'none'
    parentElement.classList.remove('has-error')
  }else{
    errorElement.textContent = error
    errorElement.style.display = 'block'
    parentElement.classList.add('has-error')
  }
}

// 创建或者返回一个错误提示元素
function getErrorElement(el) {
  const parentElement = el.parentElement
  let errorElement = parentElement.querySelector('.help-block')

  if (!errorElement) {
    const tpl = `<span class="help-block"></span>`
    const fragment = document.createRange().createContextualFragment(tpl)

    parentElement.appendChild(fragment)
    errorElement = parentElement.querySelector('.help-block')
  }

  return errorElement
}

export default {
  bind(el, binding, vnode) {
    const { value, arg, modifiers } = binding
    const eventType = ['change', 'blur', 'input'].indexOf(arg) !== -1 ? arg : 'change'
    const defaultHandler = () => {
      showError(el)
    }
    const handler = () => {
      validate(el, modifiers, value)
    }

    el.addEventListener('input', defaultHandler, false)
    el.addEventListener(eventType, handler, false)

    el.destory = () => {
      ['input', eventType].forEach((event) => {
        el.removeEventListener(event, handler, false)
      })
      el.destory = null
    }
  },
  inserted(el, binding, vnode) {
    const { value, modifiers } = binding
    const form = el.closest('[data-validator-form]')
    const submitBtn = form ? form.querySelector('[type=submit]') : null

    if (submitBtn) {
      const submitHandler = () => {
        validate(el, modifiers, value)

        const errors = form.querySelectorAll('.has-error')

        if (!errors.length) {
          submitBtn.canSubmit = true
        }else{
          submitBtn.canSubmit = false
        }
      }

      submitBtn.addEventListener('click', submitHandler, false)

      el.destorySubmitBtn = () => {
        submitBtn.removeEventListener('click', submitHandler, false)
        el.destorySubmitBtn = null
      }
    }

  },
  unbind(el) {
    el.destory()
    if (el.destorySubmitBtn) el.destorySubmitBtn()
  }
}
