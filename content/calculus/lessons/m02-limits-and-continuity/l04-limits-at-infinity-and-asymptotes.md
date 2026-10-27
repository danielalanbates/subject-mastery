# Limits at Infinity and Asymptotes

Imagine monitoring a cup of hot coffee. Its temperature starts high, perhaps one hundred ninety degrees Fahrenheit. As minutes pass, the coffee cools rapidly. However, it doesn't cool indefinitely. Instead, the temperature gradually levels off, approaching the room temperature, say, seventy degrees. In calculus, we say the coffee's temperature approaches a limit of seventy as time approaches infinity. This "end behavior"—what happens as our independent variable grows without bound—is today's focus.

In previous lessons, we focused on a function's behavior as its input approached a specific, finite number. Now, we widen our view to the entire horizon, asking about a function's "ultimate fate." When we ask for the limit of f of x as x approaches infinity, we want to know if the output values settle toward a specific height as we move far to the right on the coordinate plane. If they do settle at a number, L, then the horizontal line y equals L is called a horizontal asymptote.

Consider the reciprocal function, f of x equals one divided by x. As x gets very large, say one thousand or one billion, the function's value becomes incredibly small, just above zero. The limit as x approaches infinity of one divided by x is zero. Graphically, this means the x-axis, the line y equals zero, is a horizontal asymptote. The curve approaches this line ever closer but never touches it as it moves to the right.

The same logic applies as x approaches negative infinity, moving far to the left. For one divided by x, the limit as x approaches negative infinity is also zero. A function can have a horizontal asymptote as x approaches positive infinity, negative infinity, or both. Sometimes these are the same, as with one divided by x. Other functions might have distinct horizontal asymptotes for positive and negative infinity, or even an asymptote on only one side.

When dealing with more complex expressions, like rational functions, we need a reliable strategy. A rational function is a fraction where both the numerator and denominator are polynomials. To find the limit as x approaches infinity of, say, four x squared plus three, all divided by two x squared minus one, we use a clever algebraic trick. We divide every term by the highest power of x found in the denominator, which in this case is x squared.

Let’s apply that division. In the numerator, four x squared divided by x squared becomes four; three divided by x squared remains. In the denominator, two x squared divided by x squared becomes two; negative one divided by x squared remains. So, we have four plus three divided by x squared, all over two minus one divided by x squared. As x approaches infinity, terms like three divided by x squared shrink to zero. This leaves four divided by two, which is two. Thus, the horizontal asymptote is the line y equals two.

This technique reveals helpful rules for rational functions. If the denominator's degree is higher than the numerator's, the limit at infinity is zero. If degrees are equal, as in our example, the limit is the ratio of the leading coefficients. However, if the numerator has a higher degree, the function grows toward infinity or negative infinity. In that case, the limit does not exist, and there is no horizontal asymptote.

It is also important to consider the speed at which different types of functions grow, often called the hierarchy of growth. Logarithmic functions grow very slowly. Power functions, like x squared, grow faster. Exponential functions, like e to the power of x, grow much faster than any power function. When comparing these in a fraction, the "faster" function dominates. For example, x to the power one hundred, divided by e to the power of x, approaches zero as x approaches infinity, because exponential growth overwhelms power growth.

Understanding these limits at infinity allows us to sketch the global shape of a function without plotting a thousand points. We can see where a population might level off, where a physical system reaches equilibrium, or how a curve behaves at its furthest reaches. Now that we have an intuitive and algebraic grasp of how functions behave at their limits, we are ready to look at the rigorous mathematical foundation that supports all these ideas. In our next lesson, we will explore the formal definition of a limit, known as the epsilon-delta definition, which provides the absolute precision required for advanced calculus.

## Key ideas

- Limits at infinity describe the end behavior of a function as the input variable grows without bound in either the positive or negative direction.
- A horizontal asymptote is a horizontal line that the graph of a function approaches as x moves toward positive or negative infinity, and it may exist on one side or both.
- To find the limit of a rational function at infinity, divide every term by the highest power of x found in the denominator to see which terms vanish.
- If a function grows toward infinity or negative infinity rather than settling at a specific value, it has no horizontal asymptote at that end.
- Different types of functions grow at different rates, with exponential functions generally dominating power functions and logarithmic functions as x becomes very large.
