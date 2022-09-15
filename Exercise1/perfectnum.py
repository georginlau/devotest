def perfect_numbers(n):
    if n < 1:
        return False

    sum = 0

    for i in range(1, n):
        if n % i == 0:
            sum = sum + i
    return sum


# take inputs
n = int(input("Enter a number: "))

print("The divisors of the number are:")

sum_divisor = 0
for i in range(1, n):
    if n % i == 0:
        # print(i)
        sum_divisor = sum_divisor + i

# check perfect number or not
if n == perfect_numbers(n):
    print(n, "is a perfect number")

elif n > sum_divisor:
    print("Sum of proper divisor is: ", sum_divisor)
    print(n, "is a defective number")

elif n < sum_divisor:
    print("Sum of proper divisor is: ", sum_divisor)
    print(n, "is an abundant number")
