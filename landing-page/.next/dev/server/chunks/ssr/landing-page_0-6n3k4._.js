module.exports = [
"[project]/landing-page/lib/hooks.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useInView",
    ()=>useInView,
    "usePrefersReducedMotion",
    ()=>usePrefersReducedMotion
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
"use client";
;
function usePrefersReducedMotion() {
    const [reduced, setReduced] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const on = ()=>setReduced(mq.matches);
        on();
        mq.addEventListener("change", on);
        return ()=>mq.removeEventListener("change", on);
    }, []);
    return reduced;
}
function useInView(opts) {
    const ref = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [inView, setInView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const reduced = usePrefersReducedMotion();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (reduced) {
            setInView(true);
            return;
        }
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(([e])=>e.isIntersecting && setInView(true), {
            threshold: 0.18,
            rootMargin: "0px 0px -10% 0px",
            ...opts
        });
        io.observe(el);
        return ()=>io.disconnect();
    }, [
        reduced
    ]);
    return {
        ref,
        inView
    };
}
}),
"[project]/landing-page/components/brand/Reveal.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Reveal",
    ()=>Reveal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$landing$2d$page$2f$lib$2f$hooks$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/landing-page/lib/hooks.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$landing$2d$page$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/landing-page/lib/utils.ts [app-ssr] (ecmascript)");
"use client";
;
;
;
function Reveal({ children, delay = 0, className = "", as: Tag = "div" }) {
    const { ref, inView } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$landing$2d$page$2f$lib$2f$hooks$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInView"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Tag, {
        ref: ref,
        style: {
            transitionDelay: inView ? `${delay}ms` : "0ms"
        },
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$landing$2d$page$2f$lib$2f$utils$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cn"])("transition-all duration-700 ease-out", inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3", className),
        children: children
    }, void 0, false, {
        fileName: "[project]/landing-page/components/brand/Reveal.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=landing-page_0-6n3k4._.js.map