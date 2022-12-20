# Framework documentation
> This section is work-in-progress.

## Hooks
> This section is work-in-progress.

```ts
const params = useRequestParams(ctx, {...})
const query = useRequestQuery(ctx, {...})
const textBody = useRequestTextBody(ctx, {...})
const jsonBody = useRequestJsonBody(ctx, {...})
const formBody = useRequestFormBody(ctx, {...})
```

## Validators
> This section is work-in-progress.

Validators are run for every parameter received from the client.

**Example:**

```ts
const query = useRequestQuery(ctx, {
	name: RequiredParam(StringValidator),
	fooBar: OptionalParam<{ foo: string; bar: string }>({
		prevalidate: (v) => v.length > 5,
		rehydrate: (v) => JSON.parse(v),
		validate: (v) => !!v.foo && !!v.bar
	}),
})

query.name   // type is 'string'
query.fooBar // type is '{ foo: string; bar: string }'
```

## Built-in validators

The most common validators are available out-of-the-box.

```ts
const query = useRequestQuery(ctx, {
	myNumber: NumberValidator,
	myString: StringValidator,
	myBoolean: BooleanValidator,
})

query.myNumber  // type is 'number'
query.myString  // type is 'string'
query.myBoolean // type is 'boolean'
```

## Required and optional parameters
```ts
const query = useRequestQuery(ctx, {
	predefinedBool: BooleanValidator,
	optionalBool: OptionalParam(BooleanValidator),
	customBool: RequiredParam({
		prevalidate: (v) => v === '0' || v === '1',
		rehydrate: (v) => v === '1',
	}),
	customOptionalBool: OptionalParam({
		prevalidate: (v) => v === '0' || v === '1',
		rehydrate: (v) => v === '1',
	}),
})

query.predefinedBool     // type is 'boolean'
query.optionalBool       // type is 'boolean | undefined'
query.customBool         // type is 'boolean'
query.customOptionalBool // type is 'boolean | undefined'
```

## Custom validators

Custom validators are simple objects that can be defined either inline, or elsewhere for reusability.

### Inline

```ts
const query = useRequestQuery(ctx, {
	numberInRange: RequiredParam({
		rehydrate: (v) => Number(v),
		validate: (v) => !isNaN(v) && v >= 0 && v <= 100,
	}),
	optionalBoolean: OptionalParam({
		prevalidate: (v) => v === '0' || v === '1',
		rehydrate: (v) => v === '1',
	}),
})

query.numberInRange // type is 'number'
query.optionalBoolean // type is 'number | undefined'
```

## Anatomy of a validator

A validator contains a number of functions that are useful to check and transform incoming data.

### Rehydrate

> `rehydrate: (v: string) => T extends any`

The only required function of a validator. It takes the raw input param and transforms it into correct data type. The return type of `rehydrate` will match the one specified in the `RequiredParam` or `OptionalParam` generics, or will be used to infer the type.

Make sure that it returns a correctly typed object.

### Validate

> `validate: (v: T) => boolean`

This function is called on incoming data after it is rehydrated. 

Returning `false` or any falsy value will cause the validation to fail, and `400 Bad Request` to be sent back to the client.

### Prevalidate

> `prevalidate: (v: string) => boolean`

This function is called on incoming data before it is rehydrated. Useful in cases where rehydration function is slow (i.e. includes a DB read), and some premature validation is desired. In most cases, however, `validate` is preferred.

The behaviour is identical to `validate`, aside from the call order.

### Type inference

In many cases, type of the parameter can be inferred from the return value of `rehydrate` function. For more complex objects, it is possible to specify the type with `as ...` clause:


```ts
useRequestQuery(ctx, {
	fooBar: RequiredParam({
		prevalidate: (v) => v.length > 5,
		rehydrate: (v) => JSON.parse(v)
			as { foo: string; bar: string },
		validate: (v) => !!v.foo && !!v.bar
	}),
})
```

Alternatively, the expected type can be mentioned in `RequiredParam`, `OptionalParam` or `PathParam` generics:

```ts
useRequestQuery(ctx, {
	fooBar: RequiredParam<{ foo: string; bar: string }>({
		prevalidate: (v) => v.length > 5,
		rehydrate: (v) => JSON.parse(v),
		validate: (v) => !!v.foo && !!v.bar
	}),
})
```

### Avoid

While the following is valid code, the type of the parameter can't be inferred as TS will not parse this as Validator type. The type of `validate` will be `(v: any) => boolean`, which is unsafe.

```ts
useRequestQuery(ctx, {
	myParam: {
		rehydrate: (v) => Number(v),
		validate: (v) => v > 0,
		optional: false,
	},
})
```
