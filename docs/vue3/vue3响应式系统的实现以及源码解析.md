---
title: vue3响应式系统的实现以及源码解析
---

# 详解defineProperty和Proxy

## defineProperty [MDN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

ES5 提供了 Object.defineProperty 方法，该方法可以在一个对象上定义一个新属性，或者修改一个对象的现有属性，并返回这个对象。

### 语法
```js
Object.defineProperty(obj, prop, descriptor)
```
> 参数：
obj：必需，目标对象<br>
prop：必需，需定义或修改的属性的名字<br>
descriptor：必需，将被定义或修改的属性的描述符<br>
返回值：传入函数的对象，即第一个参数obj

### descriptor参数解析
函数的第三个参数 descriptor 所表示的属性描述符有两种形式：数据描述符和存取描述符

>数据描述：当修改或定义对象的某个属性的时候，给这个属性添加一些特性，数据描述中的属性都是可选的
>  - value：属性对应的值,可以使任意类型的值，默认为undefined
>   - writable：属性的值是否可以被重写。设置为true可以被重写；设置为false，不能被重写。默认为false
>   - enumerable：此属性是否可以被枚举（使用for...in或Object.keys()）。设置为true可以被枚举；设置为false，不能被枚举。默认为false
>   - configurable：是否可以删除目标属性或是否可以再次修改属性的特性（writable, configurable, enumerable）。设置为true可以被删除或可以重新设置特性；设置为false，不能被可以被删除或不可以重新设置特性。默认为false。这个属性起到两个作用：1、目标属性是否可以使用delete删除  2、目标属性是否可以再次设置特性
>存取描述：当使用存取器描述属性的特性的时候，允许设置以下特性属性
>   - get：属性的 getter 函数，如果没有 getter，则为 undefined。当访问该属性时，会调用此函数。执行时不传入任何参数，但是会传入 this 对象（由于继承关系，这里的this并不一定是定义该属性的对象）。该函数的返回值会被用作属性的值。默认为 undefined。
>  - set：属性的 setter 函数，如果没有 setter，则为 undefined。当属性值被修改时，会调用此函数。该方法接受一个参数（也就是被赋予的新值），会传入赋值时的 this 对象。默认为 undefined。

### 示例
- value
```js
let obj = {}
// 不设置value属性
Object.defineProperty(obj, "name", {});
console.log(obj.name); // undefined

// 设置value属性
Object.defineProperty(obj, "name", {
  value: "Demi"
});
console.log(obj.name); // Demi
```
- writable
```js
let obj = {}
  // writable设置为false，不能重写
  Object.defineProperty(obj, "name", {
    value: "Demi",
    writable: false
  });
  //更改name的值（更改失败）
  obj.name = "张三";
  console.log(obj.name); // Demi 
 
  // writable设置为true，可以重写
  Object.defineProperty(obj, "name", {
    value: "Demi",
    writable: true
  });
  //更改name的值
  obj.name = "张三";
  console.log(obj.name); // 张三
```
- enumerable
```js
let obj = {}
// enumerable设置为false，不能被枚举。
Object.defineProperty(obj, "name", {
  value: "Demi",
  writable: false,
  enumerable: false
});

// 枚举对象的属性
for (let attr in obj) {
  console.log(attr);
}

// enumerable设置为true，可以被枚举。
Object.defineProperty(obj, "age", {
  value: 18,
  writable: false,
  enumerable: true
});

// 枚举对象的属性
for (let attr in obj) {
  console.log(attr); //age
}
```
- configurable 
```js
//-----------------测试目标属性是否能被删除------------------------//
let obj = {}
// configurable设置为false，不能被删除。
Object.defineProperty(obj, "name", {
  value: "Demi",
  writable: false,
  enumerable: false,
  configurable: false
});
// 删除属性
delete obj.name;
console.log(obj.name); // Demi

// configurable设置为true，可以被删除。
Object.defineProperty(obj, "age", {
  value: 19,
  writable: false,
  enumerable: false,
  configurable: true
});
// 删除属性
delete obj.age;
console.log(obj.age); // undefined


//-----------------测试是否可以再次修改特性------------------------//
let obj2 = {}
// configurable设置为false，不能再次修改特性。
Object.defineProperty(obj2, "name", {
  value: "dingFY",
  writable: false,
  enumerable: false,
  configurable: false
});

//重新修改特性
Object.defineProperty(obj2, "name", {
    value: "张三",
    writable: true,
    enumerable: true,
    configurable: true
});
console.log(obj2.name); // 报错：Uncaught TypeError: Cannot redefine property: name

// configurable设置为true，可以再次修改特性。
Object.defineProperty(obj2, "age", {
  value: 18,
  writable: false,
  enumerable: false,
  configurable: true
});

// 重新修改特性
Object.defineProperty(obj2, "age", {
  value: 20,
  writable: true,
  enumerable: true,
  configurable: true
});
console.log(obj2.age); // 20
```
- set 和 get
```js
let obj = {
  name: 'Demi'
};
Object.defineProperty(obj, "name", {
  get: function () {
    //当获取值的时候触发的函数
    console.log('get...')
  },
  set: function (newValue) {
    //当设置值的时候触发的函数,设置的新值通过参数value拿到
    console.log('set...', newValue)
  }
});

//获取值
obj.name // get...

//设置值
obj.name = '张三'; // set... 张三
```

## Proxy
Proxy 对象用于定义基本操作的自定义行为（如属性查找，赋值，枚举，函数调用等）
其实就是在对目标对象的操作之前提供了拦截，可以对外界的操作进行过滤和改写，修改某些操作的默认行为，这样我们可以不直接操作对象本身，而是通过操作对象的代理对象来间接来操作对象，达到预期的目的~

### 语法
```js
const p = new Proxy(target, handler)
```
### 参数
> target：要使用 Proxy 包装的目标对象（可以是任何类型的对象，包括原生数组，函数，甚至另一个代理）<br>handler：也是一个对象，其属性是当执行一个操作时定义代理的行为的函数，也就是自定义的行为

### handler方法
handler 对象是一个容纳一批特定属性的占位符对象。它包含有 Proxy 的各个捕获器（trap），所有的捕捉器是可选的。如果没有定义某个捕捉器，那么就会保留源对象的默认行为。



https://blog.csdn.net/qq_38128179/article/details/111416502