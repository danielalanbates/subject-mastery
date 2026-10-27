# One Sided Limits and Existence

Imagine walking along two mountain paths that lead toward the same narrow canyon. If both paths meet at the exact same ledge, you have a single, unambiguous destination. But what if the path from the west ends at a high overlook, while the path from the east ends on the canyon floor far below? Even though you are heading toward the same horizontal coordinate, your final elevation depends on the direction from which you arrive. In this situation, there is no single destination for the canyon as a whole.

In our study of limits, we observe how a function behaves as an input variable x gets closer and closer to a chosen number, which we will call c. To analyze this behavior precisely, we separate the approach from the left side from the approach from the right side. We call these one-sided limits. A left-hand limit considers values of x that are strictly smaller than c. A right-hand limit considers values of x that are strictly larger than c. Using clear and consistent terms, we refer to these as the left-hand limit and the right-hand limit.

The fundamental rule for the existence of a two-sided limit is straightforward. For a general limit to exist as x approaches c, the left-hand limit and the right-hand limit must both exist and equal the exact same number, which we can call L. Suppose the left-hand limit as x approaches c is five. Suppose the right-hand limit as x approaches c is also five. Then the overall two-sided limit is five. However, if the left-hand limit is five while the right-hand limit is ten, the two paths do not meet. In that case, we state that the two-sided limit as x approaches c does not exist. It is like a bridge where the two halves were built at different heights, leaving a gap between them.

It is crucial to realize that a limit can exist even if the function is not defined at the target point c itself. Limits describe where the function is going, not where it lands. This distinction leads directly to the concept of continuity. A function is continuous at a point c if three specific conditions are met: first, the function must be defined at c; second, the two-sided limit as x approaches c must exist; and third, that two-sided limit must equal the actual function value at c.

Let us walk through a worked example using a piecewise function. A piecewise function uses different formulas on different intervals. Consider a function f of x defined in two parts. For all values of x less than two, f of x equals x. For all values of x greater than or equal to two, f of x equals x plus three. We wish to find the limit of f of x as x approaches two.

First, we calculate the left-hand limit. As x approaches two from the left—using values like one point nine, then one point nine nine—the function follows the rule f of x equals x. Therefore, the left-hand limit is two. Next, we calculate the right-hand limit. As x approaches two from the right—using values like two point one, then two point zero one—the function follows the rule f of x equals x plus three. Evaluating two plus three gives five. Thus, the right-hand limit is five. Because the left-hand limit of two does not equal the right-hand limit of five, the overall two-sided limit as x approaches two does not exist.

Consider another classic example: the function f of x equals the absolute value of x, divided by x. We evaluate the limit as x approaches zero. For values of x greater than zero, the absolute value of x is simply x. Thus, x divided by x equals one, making the right-hand limit equal to one. For values of x less than zero, the absolute value of x equals negative x. Thus, negative x divided by x equals negative one, making the left-hand limit equal to negative one. Because the right-hand limit of one differs from the left-hand limit of negative one, the overall limit at zero does not exist.

One-sided limits can also be infinite. If a function grows without bound as x approaches c from one side, the one-sided limit approaches positive infinity or negative infinity. If either one-sided limit is infinite, the standard finite two-sided limit does not exist, though in the extended real number system we can describe the directional behavior precisely.

Historically, the rigorous foundations of calculus developed over centuries. Both Isaac Newton and Gottfried Wilhelm Leibniz created calculus independently in the seventeenth century, though their priority dispute over who invented it first was notoriously bitter. Newton used dot notation for quantities changing over time, whereas Leibniz introduced the d x and integral notation that remains standard today.

By examining left-hand and right-hand limits, we ensure our analysis handles jumps, breaks, and vertical asymptotes correctly before moving to formal algebraic techniques.

## Key ideas

- A left-hand or right-hand limit describes the value a function approaches as the input variable x nears a target value from only one direction.
- A two-sided limit exists at a target point if and only if both the left-hand and right-hand limits exist and are equal to the same value.
- A limit can exist at a point even if the function is undefined there, whereas continuity requires the function to be defined, the limit to exist, and the limit to equal the function value.
- One-sided limits can approach positive or negative infinity, which indicates vertical asymptotic behavior and means a finite two-sided limit does not exist.
- Piecewise functions and absolute value functions often require examining one-sided limits to detect jump discontinuities where the two sides do not meet.
