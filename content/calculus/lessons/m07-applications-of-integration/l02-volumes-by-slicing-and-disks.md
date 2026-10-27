# Volumes by Slicing and Disks

Imagine slicing a loaf of artisan bread into paper-thin pieces. If you measure the area of the cut face of each slice and multiply it by its tiny thickness, you get the volume of that single piece. Summing the volumes of all those thin slices from crust to crust yields the volume of the entire loaf. In our previous lesson, we found the area between two curves by summing the areas of infinitely narrow rectangles across an interval. Now, we carry that same intuition into three dimensions.

To determine the volume of any solid by slicing, we set up an axis along the direction of the cuts. Suppose the solid extends from a left endpoint at x equals p to a right endpoint at x equals q. At each position x, the perpendicular cut produces a cross section with area capital S of x. The volume of an infinitesimal slice of thickness d x is capital S of x multiplied by d x. To find the total volume, we accumulate these slices by taking the definite integral from p to q of capital S of x, d x.

This process directly mirrors the notation introduced by Gottfried Wilhelm Leibniz, who used the elongated s symbol to signify an infinite sum of differential pieces. Isaac Newton developed his own version of calculus using rates of change called fluxions. The two thinkers waged a bitter priority dispute over who discovered the subject first, yet it is Leibniz's differential notation that gives modern geometry such visual clarity.

A particularly useful class of three-dimensional shapes consists of solids of revolution. We form a solid of revolution by taking a two-dimensional region bounded by curves and spinning it completely around a line, known as the axis of revolution. When we revolve a region around the horizontal x-axis and slice the resulting solid perpendicular to that axis, every single cross section is a flat circular disk.

Because each slice is a circle, its area is pi times the radius squared. If the upper boundary of our region is given by the curve y equals f of x, the distance from the x-axis up to the curve is the radius of the circle. Integrating this area from the left endpoint to the right endpoint gives the disk method formula: the volume equals the integral of pi times the quantity f of x, all squared, d x.

Let us test this method with a concrete example. Consider the curve y equals the square root of x, bounded below by the x-axis, extending from x equals zero to x equals four. We revolve this region around the x-axis to create a bowl-shaped solid. The cross-sectional area of our slice is pi times x. Evaluating the definite integral from zero to four of pi times x, d x, yields our final volume of eight pi cubic units.

Now consider what happens when the region we revolve does not touch the axis of rotation, or when it lies between two curves. Spinning such a region creates a hole through the center of the solid. Slicing perpendicular to the axis of rotation no longer yields solid disks. Instead, it produces washers: flat circular rings with a hole in the middle.

To find the area of a washer, we take the area of the entire outer circle and subtract the area of the missing inner circle. Let capital R of x represent the outer radius, and little r of x represent the inner radius. The area of the cross section is pi times the difference between the outer radius squared and the inner radius squared. Avoid a common trap: this is not pi times the square of the difference; it is the difference of the squares.

Slicing perpendicular to the axis of rotation is powerful, but it requires that we express our radii in terms of the variable along that axis. In our next lesson, we will explore an alternate strategy called the method of cylindrical shells, which slices solids parallel to the axis of rotation instead.

## Key ideas

- The slicing method calculates the volume of a solid by integrating its cross-sectional area, capital S of x, along an axis from one boundary endpoint to the other.
- The disk method applies when a region adjacent to the axis of revolution is rotated, producing solid circular cross sections with area equal to pi times the radius squared.
- The washer method applies when revolving a region creates a hollow interior, producing cross sections whose area is pi times the quantity outer radius squared minus inner radius squared.
- Both Isaac Newton and Gottfried Wilhelm Leibniz developed the calculus underlying these methods, though they engaged in a bitter priority dispute over who discovered it first.
