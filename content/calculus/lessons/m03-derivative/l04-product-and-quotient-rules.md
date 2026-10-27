# Product and Quotient Rules

Imagine calculating total revenue for a growing business. Revenue equals price multiplied by the number of items sold. In a dynamic market, both price and sales volume change continuously over time. To find the rate at which total revenue changes, you might be tempted to multiply the rate of price change by the rate of sales change. However, calculus reveals that the derivative of a product is not simply the product of individual derivatives.

To see why, picture a rectangle whose width and length expand over time. Area equals length times width. As both sides grow, total area expands in two directions. The increasing length stretches out along the current width, creating new area. Meanwhile, the increasing width stretches along the current length, creating additional area. The overall rate of area growth depends on both original dimensions and both individual rates of change.

This geometric intuition leads directly to the product rule. If a function is constructed by multiplying two expressions, f of x and g of x, its derivative is the first function times the derivative of the second, plus the second function times the derivative of the first. In spoken words, the derivative of f of x times g of x is f of x times g prime of x, plus g of x times f prime of x.

By mathematical induction, this rule extends to products with three or more factors. For three functions, the derivative is a sum of three terms, where in each term we differentiate one factor while leaving the other two unchanged.

Let us walk through a concrete example. Suppose we want the derivative of h of x, defined as x squared times the quantity x plus three. Let our first function, f of x, be x squared. Using the power rule, its derivative, f prime of x, is two x. Let our second function, g of x, be x plus three. Its derivative, g prime of x, is one.

Now we apply the product rule step by step. First, we multiply the original first function by the derivative of the second: x squared times one, giving x squared. Next, we multiply the original second function by the derivative of the first: the quantity x plus three times two x. Expanding yields two x squared plus six x. Finally, we add these results together. Combining x squared and two x squared plus six x gives three x squared plus six x.

We check our answer by expanding the expression before taking derivatives. Expanding x squared times the quantity x plus three gives x cubed plus three x squared. Taking the derivative directly with the power rule yields three x squared plus six x, matching our product rule result.

Now consider division. When one function is divided by another, such as f of x divided by g of x, we apply the quotient rule. Crucially, this rule is valid only where the denominator function, g of x, is not equal to zero, because division by zero is undefined.

To derive the quotient rule, define q of x as f of x divided by g of x. Multiplying both sides by g of x gives f of x equals q of x times g of x. Differentiating both sides with the product rule yields f prime of x equals q prime of x times g of x, plus q of x times g prime of x. Isolating q prime of x and substituting f of x divided by g of x back in for q of x reveals the quotient rule formula.

In words, the derivative of f of x divided by g of x is the denominator g of x times f prime of x, minus the numerator f of x times g prime of x, all divided by the quantity g of x, squared.

Let us apply the quotient rule to h of x equals x divided by the quantity x plus two, where x is not negative two. The top function is f of x equals x, with derivative f prime of x equal to one. The bottom function is g of x equals x plus two, with derivative g prime of x equal to one.

To build the numerator, we multiply the bottom function by the derivative of the top: the quantity x plus two times one, which is x plus two. Subtract the top function times the derivative of the bottom: x times one, which is x. Subtracting x from x plus two leaves two. The denominator is the original bottom function squared. Thus, the derivative h prime of x is two divided by the quantity x plus two, all squared.

Isaac Newton and Gottfried Wilhelm Leibniz both established these operational rules in the late seventeenth century, though their bitter priority dispute over inventing calculus lasted for life. Newton used a dot notation called fluxions, whereas Leibniz introduced the differential d y over d x notation, framing rates of change as ratios of differences.

## Key ideas

- The product rule states that the derivative of two functions multiplied together is the first function times the derivative of the second, plus the second function times the derivative of the first, and it extends to multiple factors via mathematical induction.
- The quotient rule calculates the derivative of one function divided by another, requiring the denominator function to be nonzero.
- The quotient rule can be derived algebraically by applying the product rule to the equation formed by multiplying the quotient function by its denominator.
- Isaac Newton and Gottfried Wilhelm Leibniz independently established these differentiation rules, with Newton introducing fluxion notation and Leibniz introducing differential d y over d x notation, years before their bitter priority dispute.
