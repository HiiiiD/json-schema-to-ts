import { Get } from "../../utils/index.d.ts";
import { MetaType, Never, Error } from "../index.d.ts";
import { Value } from "../primitive.d.ts";
import { ExcludeUnion } from "./union.d.ts";
import { ExcludeIntersection } from "./intersection.d.ts";
import { ExcludeExclusion } from "./exclusion.d.ts";
export declare type ExcludeFromPrimitive<A, B> = {
    any: Never;
    never: A;
    const: A;
    enum: A;
    primitive: Value<A> extends Value<B> ? Never : A;
    array: A;
    tuple: A;
    object: A;
    union: ExcludeUnion<A, B>;
    intersection: ExcludeIntersection<A, B>;
    exclusion: ExcludeExclusion<A, B>;
    error: B;
    errorTypeProperty: Error<"Missing type property">;
}[Get<B, "type"> extends MetaType ? Get<B, "type"> : "errorTypeProperty"];