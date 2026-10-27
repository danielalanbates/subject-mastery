# Implicit Differentiation

Imagine drawing a circle on a sheet of paper. A circle is one of the most familiar shapes in geometry, yet it poses an immediate challenge for standard calculus. Because a vertical line can cross a circle twice, the circle as a whole fails the vertical line test. It cannot be represented as a single function where y equals f of x. Up until now, we have dealt almost exclusively with explicit functions, where the variable y sits isolated on the left side, equal to an expression containing only x.

To solve this, we turn to implicit differentiation. This technique relies directly on the chain rule. In an implicit equation, we do not need to solve for y first. Instead, we accept that y represents some valid function of x, even if we cannot easily write down its formula. We then differentiate both sides of the equation with respect to x, applying our standard differentiation rules step by step.

The essential secret to implicit differentiation lies in how we handle terms containing y. Whenever we differentiate an expression involving y with respect to x, we must apply the chain rule. We take the derivative of the expression with respect to y, and then multiply that result by d y over d x. This extra factor of d y over d x is the chain rule at work, accounting for the fact that y itself depends on x. Gottfried Wilhelm Leibniz created a powerful fraction-style notation for calculus, writing d y over d x, which shines brightest here by clearly reminding us which variable is changing with respect to which.

Let us walk through a concrete example using our circle. Suppose we have the equation x squared plus y squared equals twenty-five, which defines a circle centered at the origin with a radius of five. We want to find the slope of the tangent line at any point on this circle without splitting it into separate top and bottom functions.

We begin by taking the derivative of every term on both sides with respect to x. First, the derivative of x squared with respect to x is simply two x. Next, we tackle y squared. Thinking of y as an inner function, the outer rule gives two y, and the chain rule requires us to multiply by the derivative of the inside, giving two y times d y over d x. Finally, the right side of the equation is the constant twenty-five, and the derivative of any constant is zero.

Putting these pieces together yields a new linear equation in terms of d y over d x. We have two x, plus two y times d y over d x, equals zero. Now, our goal is simply to isolate d y over d x using standard algebra. We subtract two x from both sides, leaving two y times d y over d x equal to negative two x. Then, we divide both sides by two y, giving us d y over d x equals negative x divided by y.

Notice something remarkable about this result. The derivative depends on both x and y. This makes complete sense because a single x value on a circle corresponds to two different points, one on the upper arc and one on the lower arc. To find the exact numerical slope, we must plug in the coordinates of the specific point we care about.

For instance, consider the point three, four, which lies on our circle because three squared plus four squared equals twenty-five. Plugging three in for x and four in for y into our derivative formula yields d y over d x equals negative three fourths. Picturing the circle in the coordinate plane, at the point three, four in the upper right quadrant, the circle is curving downward to the right, so a tangent line with a negative slope of negative three fourths is precisely what our geometric intuition expects.

Implicit differentiation also applies naturally when variables are multiplied together. Consider an equation like the product of x and y equals a constant. To differentiate this product with respect to x, we use the product rule on the left side. The derivative of x is one, multiplied by y, plus x multiplied by the derivative of y with respect to x, which is d y over d x. Setting this equal to the derivative of the constant, which is zero, and solving gives d y over d x equals negative y divided by x, showing that this powerful technique works far beyond simple powers.

## Key ideas

- Implicit differentiation allows us to find the derivative of an equation where the dependent variable is not isolated on one side.
- When differentiating an expression containing y with respect to x, we apply the chain rule by multiplying the derivative of the y term by d y over d x.
- After differentiating both sides of an implicit equation, we use algebra to collect and isolate the d y over d x term.
- If the denominator in the final derivative expression equals zero while the numerator does not, as on our circle where y is zero, the tangent line is vertical.
