# Limit Laws and Algebraic Evaluation

Imagine you are driving across a bridge. Suddenly, you see a tiny, microscopic gap in the middle of the road. If you were to park your car exactly on that gap, you might fall through. However, as you drive toward that gap from either direction, you can clearly see exactly where the road is supposed to be. In calculus, we frequently encounter functions that have these microscopic gaps where the function itself is undefined. Previously, we explored limits using tables and graphs to estimate where a function was headed. Today, we move beyond estimation to calculate limits with algebraic precision.

To calculate limits precisely, we use the Limit Laws. These laws apply when the individual limits of the functions exist. The Constant Law states that the limit of a constant value, like five, is simply that constant. Limits behave predictably with basic arithmetic. If you know the limit for two different functions as x approaches a specific value, you can combine them easily. The limit of a sum is the sum of individual limits, and the same applies to subtraction and multiplication.

The Constant Multiple Law states that the limit of a constant times a function is that constant multiplied by the function's limit. The Power Law allows us to take the limit of a function first, then raise the result to an exponent. Finally, the Quotient Law states that the limit of a fraction is the quotient of the limits, provided the denominator's limit is not zero. Essentially, for functions built from basic arithmetic, you can find the limit of the whole by finding the limits of its parts.

For many common functions, such as polynomials, finding a limit is remarkably straightforward. This is known as the Direct Substitution Property. If you want to find the limit as x approaches three of the expression x squared plus five, you can simply plug the number three into the expression. Three squared is nine, and nine plus five is fourteen. This works because these functions are continuous at those points, meaning the value the function is approaching is the same as the value the function actually reaches.

Calculus becomes powerful when direct substitution fails, often with rational functions, which are fractions of polynomials. Consider finding the limit as x approaches two of the quantity x squared minus four, divided by the quantity x minus two. Direct substitution yields zero divided by zero, an indeterminate form. This doesn't mean the limit doesn't exist; rather, it provides no useful information. It's a mathematical shrug, requiring further work to find the actual limit.

To resolve an indeterminate form, we use algebra to reveal the hidden behavior of the function near the gap. Let us look at that numerator again: x squared minus four. This is a classic algebraic pattern called a difference of squares. It can be factored into the quantity x minus two, times the quantity x plus two. Now, let us look at the entire fraction again. We have the quantity x minus two, times the quantity x plus two, all divided by the quantity x minus two.

From algebra, we know to be careful canceling terms that could be zero. However, the limit's definition helps: as x approaches two, x never actually equals two. Thus, the term x minus two is never exactly zero. It might be one thousandth, or negative one thousandth, but it is not zero. Because it is not zero, we are allowed to cancel the x minus two from both the numerator and denominator.

Once we cancel those terms, the complicated fraction simplifies down to the much simpler expression x plus two. We have effectively filled in the hole in the function to see where the path was leading. Now that the problematic denominator is gone, we can use direct substitution. We plug the value of two into our simplified expression. Two plus two equals four. Therefore, even though the original function was technically undefined at the point where x equals two, the limit as x approaches two is exactly four.

Sir Isaac Newton and Gottfried Wilhelm Leibniz created calculus in the seventeenth century and bitterly disputed who came first, but the limit itself was made rigorous only in the nineteenth century, by Augustin-Louis Cauchy and Karl Weierstrass. Newton used dot notation, while Leibniz gave us the d over d x notation we often use today. Mastering these algebraic techniques is essential for handling the complex ratios at calculus's core.

## Key ideas

- The Limit Laws allow us to calculate the limits of sums, products, and quotients by evaluating the limits of the individual parts, provided those individual limits exist.
- The Direct Substitution Property applies to continuous functions like polynomials, where the limit as x approaches a value is simply the function's value at that point.
- An indeterminate form like zero divided by zero indicates that the limit cannot be determined by substitution alone and requires algebraic simplification, such as factoring.
- When evaluating limits, we can cancel common factors in the numerator and denominator because the limit describes the function's behavior near a point, not at the point itself.
