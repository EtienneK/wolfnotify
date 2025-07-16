import 'typed-htmx'

declare module 'hono/jsx' {
  namespace JSX {
    interface HTMLAttributes extends HtmxAttributes {}
  }
}

export type DeepReadonly<T> = T extends Function ? T :
  T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } : T

export type Writeable<T> = { -readonly [P in keyof T]: T[P] }
export type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> }
