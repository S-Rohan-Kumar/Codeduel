# CodeDuel Problems Dump

## Problem: Beautiful Numbers (cf-2203-B)
- Difficulty: Easy
- Time Limit: 2s
- Memory Limit: 512MB

### Description:
```
Let's define $$$F(x)$$$ as the sum of the digits of $$$x$$$. An integer $$$x$$$ is considered beautiful if $$$F(F(x)) = F(x)$$$.You are given an integer $$$x$$$. In one move, you can choose any digit in the number and replace it with another. The resulting number cannot have leading zeros.Your task is to calculate the minimum number of moves (possibly zero) required to make the given number beautiful.

### Input Description
The first line contains a single integer $$$t$$$ ($$$1 \le t \le 10^4$$$) — the number of test cases.The only line of each test case contains a single integer $$$x$$$ ($$$1 \le x \le 10^{18}$$$).

### Output Description
For each test case, print a single integer — the minimum number of moves (possibly zero) required to make the given number beautiful.

### Note
In the first example, the given number is already beautiful.In the second example, in one move, we can get the beautiful number $$$3\underline{3}$$$ (the changed digit is underlined).In the third example, in two moves, we can get the beautiful number $$$\underline{1}4\underline{0}$$$ (the changed digits are underlined).
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
4
1
4
12
30
```
- **Expected Output**:
```
YES
YES
YES
YES
```

#### Testcase 2:
- **Input**:
```
2
7
11
```
- **Expected Output**:
```
NO
NO
```

#### Testcase 3:
- **Input**:
```
1
36
```
- **Expected Output**:
```
YES
```

---

## Problem: Test Generator (cf-2203-C)
- Difficulty: Hard
- Time Limit: 2s
- Memory Limit: 512MB

### Description:
```
You are developing a test generator. It takes two integers $$$s$$$ and $$$m$$$ as input. You need to construct an array of non-negative integers $$$a = [a_{1}, a_{2}, \dots, a_{n}]$$$ such that:  $$$\displaystyle\sum_{i=1}^{n} a_i = s$$$;  for each $$$i$$$, the condition $$$a_i \,\&\, m = a_i$$$ holds, where $$$\&$$$ denotes the bitwise AND operator. In other words, in each number $$$a_i$$$, the bits that are set to one can only be in the positions where the bits in the number $$$m$$$ are also set to one.Determine whether there exists at least one such array. If it exists, find the minimum possible length $$$n$$$.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. Each test case consists of a single line containing two integers $$$s$$$ and $$$m$$$ ($$$1 \le s, m \le 10^{18}$$$) — parameters of the generator.

### Output Description
For each test case, print one integer:  if such an array does not exist, print $$$-1$$$;  otherwise, print the minimum possible value of $$$n$$$ — the length of the array.

### Note
Let's analyze some examples:  For $$$s = 13, m = 5$$$, the answer is $$$3$$$, as there is a suitable array $$$a = [5, 4, 4]$$$;  For $$$s = 13, m = 3$$$, the answer is $$$5$$$, as there is a suitable array $$$a = [3, 3, 3, 3, 1]$$$;  For $$$s = 13, m = 6$$$, the answer is $$$-1$$$, as there is no suitable array.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Right Maximum (cf-2204-B)
- Difficulty: Easy
- Time Limit: 2s
- Memory Limit: 512MB

### Description:
```
You are given an array $$$a$$$ consisting of $$$n$$$ integers.While the array is not empty, an operation is performed consisting of two steps:  first, the maximum element in the array is chosen (if there are multiple maximum elements, the rightmost maximum is chosen);  then, all elements after the chosen element, including it, are removed from the array. Your task is to calculate the number operations that will be performed before the array becomes empty.

### Input Description
The first line contains one integer $$$t$$$ ($$$1 \le t \le 10^4$$$) — the number of test cases.Each test case consists of two lines:  the first line contains one integer $$$n$$$ ($$$2 \le n \le 2 \cdot 10^5$$$);  the second line contains $$$n$$$ integers $$$a_1, a_2, \dots, a_n$$$ ($$$1 \le a_i \le n$$$). Additional constraint on the input: the sum of $$$n$$$ over all test cases does not exceed $$$2 \cdot 10^5$$$.

### Output Description
For each test case, print one integer — the number of operations that will be performed.

### Note
In the first example, the array is $$$[2, 1, 2, 3, 1]$$$. The following operations are performed on it:  first, the $$$4$$$-th element is chosen. The last two elements are removed, and the array becomes $$$[2, 1, 2]$$$;  then, the $$$3$$$-rd element is chosen. The last element is removed, and the array becomes $$$[2, 1]$$$;  then, the $$$1$$$-st element is chosen. Both elements are removed, so the array becomes empty after $$$3$$$ operations.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
3
4
1 3 2 4
3
3 2 1
5
1 2 3 4 5
```
- **Expected Output**:
```
4 4 4 0
0 0 0
5 5 5 5 0
```

#### Testcase 2:
- **Input**:
```
1
5
5 1 4 2 3
```
- **Expected Output**:
```
0 4 4 0 0
```

#### Testcase 3:
- **Input**:
```
1
3
2 2 2
```
- **Expected Output**:
```
0 0 0
```

---

## Problem: Alternating Path (cf-2204-D)
- Difficulty: Hard
- Time Limit: 2s
- Memory Limit: 256MB

### Description:
```
Alternating Path

Full statement at: https://codeforces.com/problemset/problem/2204/D
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
4
1 2 3 4
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
6
1 2 3 4 5 6
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 3:
- **Input**:
```
1
2
1 2
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Simons and Posting Blogs (cf-2205-C)
- Difficulty: Hard
- Time Limit: 2s
- Memory Limit: 256MB

### Description:
```
This life is like a TV show; we're swept along as the plotlines go.— SHUN, TRAPThere are $$$n$$$ blogs. The $$$i$$$-th blog mentioned $$$l_i$$$ users in order as an array $$$a_i=[a_{i,1},a_{i,2},\ldots,a_{i,l_i}]$$$.You are going to post all $$$n$$$ blogs. Let us maintain a sequence $$$Q$$$ that describes the list of users you have recently mentioned. You need to perform the following operation exactly $$$n$$$ times:  Choose an unposted blog $$$i$$$ ($$$1\le i\le n$$$), then post it. This will cause the following operations for each $$$1\le j\le l_i$$$ in order:   If $$$a_{i,j}$$$ already exists in $$$Q$$$, then move $$$a_{i,j}$$$ to the beginning of $$$Q$$$.  Otherwise, insert $$$a_{i,j}$$$ at the beginning of $$$Q$$$.  Find the lexicographically smallest$$$^{\text{∗}}$$$ $$$Q$$$ after all $$$n$$$ operations.$$$^{\text{∗}}$$$An array $$$x$$$ is lexicographically smaller than an array $$$y$$$ if and only if one of the following holds:   $$$x$$$ is a prefix of $$$y$$$, but $$$x \ne y$$$; or  in the first position where $$$x$$$ and $$$y$$$ differ, the array $$$x$$$ has a smaller element than the corresponding element in $$$y$$$.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 1000$$$). The description of the test cases follows. The first line contains a single integer $$$n$$$ ($$$1\le n\le 3000$$$) — the number of blogs.Then $$$n$$$ lines follow, the $$$i$$$-th line starting with an integer $$$l_i$$$ ($$$1\le l_i\le 3000$$$), describing the number of users mentioned in the $$$i$$$-th blog, which is followed by $$$l_i$$$ integers $$$a_{i,1},a_{i,2},\ldots,a_{i,l_i}$$$ ($$$1\le a_{i,j}\le 10^6$$$) — the list of users mentioned in the $$$i$$$-th blog.It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$3000$$$. Denote $$$\sum\limits_{i=1}^n l_i$$$ as $$$L$$$. It is guaranteed that the sum of $$$L$$$ over all test cases does not exceed $$$3000$$$.

### Output Description
Denote $$$m$$$ as the number of users mentioned in at least one blog. For each test case, output $$$m$$$ integers $$$Q_1,Q_2,\ldots,Q_m$$$ — the lexicographically smallest $$$Q$$$.

### Note
In the first test case, you can post the blogs as follows:  Post the first blog, and $$$Q$$$ will become $$$[6,4,3,2,1]$$$.  Post the third blog, and $$$Q$$$ will become $$$[3,2,9,1,6,4]$$$.  Post the second blog, and $$$Q$$$ will become $$$[1,5,2,3,9,6,4]$$$. There is another method to post blogs:  Post the third blog, and $$$Q$$$ will become $$$[3,2,9,1]$$$.  Post the first blog, and $$$Q$$$ will become $$$[6,4,3,2,1,9]$$$.  Post the second blog, and $$$Q$$$ will become $$$[1,5,2,6,4,3,9]$$$. We can see that $$$[1,5,2,3,9,6,4]$$$ is lexicographically smaller than the other one. If we do not post the second blog at the end, the first element of the array will not be $$$1$$$, so $$$[1,5,2,3,9,6,4]$$$ is the lexicographically smallest array $$$Q$$$.In the second test case, you can post the blogs as follows:  Post the first blog, and $$$Q$$$ will become $$$[6,1]$$$.  Post the second blog, and $$$Q$$$ will keep itself $$$[6,1]$$$. In the third test case, you have to post the only blog, and $$$Q$$$ will become $$$[1,6]$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Time Display Stickers (cf-2206-K)
- Difficulty: Medium
- Time Limit: 2s
- Memory Limit: 1024MB

### Description:
```
You have a collection of $$$n$$$ digit stickers, represented by a string $$$S$$$ of length $$$n$$$. Each character of $$$S$$$ is a digit 0 through 9, representing one sticker of that digit.You want to create time displays using these stickers. Each time display shows a time in the format HH:MM, where:   HH is a two-digit hour between $$$00$$$ and $$$11$$$ (inclusive), and  MM is a two-digit minute between $$$00$$$ and $$$59$$$ (inclusive). In other words, each time display requires exactly four stickers: two for the hours and two for the minutes. Each sticker can only be used for at most one time display.What is the maximum number of time displays you can create?

### Input Description
The first line of input contains one integer $$$t$$$ ($$$1 \le t \le 10\,000$$$) representing the number of test cases. After that, $$$t$$$ test cases follow. Each of them is presented as follows.The first line of each test case contains an integer $$$n$$$ ($$$1 \le n \le 10^6$$$).The second line contains a string $$$S$$$ of length $$$n$$$, consisting only of digits 0–9.The sum of $$$n$$$ across all test cases in one input file does not exceed $$$10^6$$$.

### Output Description
For each test case, output the maximum number of time displays you can create.

### Note
Explanation for the sample input/output #1For the first test case, you can create one time display 10:59. It can be shown that you cannot create two displays for a given collection of stickers.For the second test case, you can create two time displays: 10:59 and 04:27.For the third test case, you can create two time displays: 11:19 and 11:19.For the fourth test case, you cannot create any time displays.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: 1-1 (cf-2207-A)
- Difficulty: Easy
- Time Limit: 1s
- Memory Limit: 256MB

### Description:
```
Good Egg Galaxy — Koji Kondo, Super Mario Galaxy   Let $$$n$$$ be a positive integer. Mario has a binary string$$$^{\text{∗}}$$$ $$$s$$$ of length $$$n$$$. In one move, he can choose any position $$$i$$$ ($$$2 \leq i \leq n-1$$$) such that it's between two 1's, i.e., $$$s_{i-1} = s_{i+1} = \texttt{1}$$$, and then set $$$s_i$$$ to either 0 or 1.Mario can perform this operation as many times as he wants (possibly zero). What's the minimum and maximum number of 1's that can be in the resulting string?$$$^{\text{∗}}$$$A binary string is a string whose characters are either 0 or 1.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 500$$$). The description of the test cases follows. The first line of each test case contains an integer $$$n$$$ ($$$3 \leq n \leq 100$$$) — the length of the string.The second line of each test case contains a string $$$s$$$ of length $$$n$$$ consisting of characters 0 or 1.

### Output Description
For each test case, output two integers — the minimum and maximum number of 1's in the resulting string after some number of moves.

### Note
In the first test case, the minimum number of 1's that can be in the resulting string is $$$2$$$. This is done by transforming the string as follows: $$$$$$\mathtt{1}\underline{\mathtt{1}}\mathtt{1} \to \mathtt{101}.$$$$$$ The maximum number of 1's that can be in the resulting string is $$$3$$$, by doing nothing.In the second test case, the minimum number of 1's that can be in the resulting string is $$$3$$$. This is done by transforming the string as follows: $$$$$$\mathtt{011}\underline{\mathtt{0}}\mathtt{11} \to \mathtt{01}\underline{\mathtt{1}}\mathtt{111} \to \mathtt{0101}\underline{\mathtt{1}}\mathtt{1} \to \mathtt{010101}.$$$$$$ The maximum number of 1's that can be in the resulting string is $$$5$$$. This is done by transforming the string as follows: $$$$$$\mathtt{011}\underline{\mathtt{0}}\mathtt{11} \to \mathtt{011111}.$$$$$$
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
3
3
111
4
1010
1
0
```
- **Expected Output**:
```
2 3
2 2
0 0
```

#### Testcase 2:
- **Input**:
```
1
5
11111
```
- **Expected Output**:
```
3 5
```

#### Testcase 3:
- **Input**:
```
1
6
110110
```
- **Expected Output**:
```
3 4
```

---

## Problem: One Night At Freddy's (cf-2207-B)
- Difficulty: Hard
- Time Limit: 1s
- Memory Limit: 256MB

### Description:
```
Five Nights at Freddy's 1 Song — The Living Tombstone Let $$$n, m, \ell$$$ be positive integers. You have made the unfortunate decision to work as a night guard at Freddy Fazbear's Pizzeria, where there are $$$m$$$ animatronics numbered $$$1, \ldots, m$$$ waiting to jumpscare you.The night consists of $$$\ell$$$ seconds, numbered $$$1, \ldots, \ell$$$. The $$$j$$$-th of the $$$m$$$ animatronics has a danger level $$$d_j$$$, and initially $$$d_1 = \ldots = d_m = 0$$$. Every second, the danger level of exactly one animatronic will increase by $$$1$$$, and throughout the night, you are able to observe all values of $$$d_j$$$ at the current time. For example, if $$$m = 2$$$, one possible list of danger levels after $$$5$$$ seconds is $$$[d_1, d_2] = [2, 3]$$$.You are not defenseless, however. At each of the $$$n$$$ fixed times $$$a_i$$$ ($$$1 \leq a_1  \lt  \ldots  \lt  a_n \leq \ell$$$), you can shine your flashlight on exactly one animatronic $$$j_i$$$ of your choice. This occurs immediately after the $$$a_i$$$-th second and sets its danger level back to zero, i.e. $$$d_{j_i} := 0$$$. Note that this choice is made independently for each flashlight use $$$a_i$$$. Continuing the example from before, if $$$a_1 = 5$$$ and you choose to flash the second animatronic at that time, the danger levels after $$$5$$$ seconds will be $$$[d_1, d_2] = [2, 0]$$$.Let the overall danger be the maximum danger across all animatronics, i.e. $$$\max_{1 \leq j \leq m} d_j$$$. You will lose if the overall danger at the end of the night (after $$$\ell$$$ seconds) is greater than $$$x$$$. Find the minimum value of $$$x$$$ such that regardless of the actions of the animatronics, you can guarantee that overall danger will be less than or equal $$$x$$$.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. The first line of each test case contains three integers $$$n$$$, $$$m$$$, and $$$\ell$$$ ($$$1 \leq n, m, \ell \leq 2 \cdot 10^5, n \leq \ell, 1 \leq m \cdot \ell \leq 2 \cdot 10^5$$$) — the number of flashlight actions, animatronics, and the length of the night, respectively.The next line contains $$$n$$$ integers $$$a_i$$$ ($$$1 \leq a_1  \lt  \ldots  \lt  a_n \leq \ell$$$) — the times at which you get to shine your flashlight.It is guaranteed that the sum of $$$m \cdot \ell$$$ over all test cases does not exceed $$$2 \cdot 10^5$$$.

### Output Description
For each test case, output a single integer — the minimum $$$x$$$ such that you can guarantee that your final danger level is at most $$$x$$$.

### Note
In the first test case, there are $$$2$$$ animatronics and a night length of $$$10$$$, and you get to flash after the $$$10$$$-th second. We will show that $$$x = 5$$$ is always possible. After $$$10$$$ seconds, notice that one animatronic must have at least $$$5$$$ danger, and the other must have at most $$$5$$$ danger. So, we can flash the higher one and get a final danger level at most $$$5$$$. It can be shown that $$$5$$$ is the minimum possible value of $$$x$$$.In the second test case, there is only one animatronic and a night length of $$$32$$$. Notice that in this case, the animatronic just increments its danger by $$$1$$$ each second. So, after the $$$25$$$-th second, we reset its danger to $$$0$$$. Seven more seconds pass before the night ends, so the final danger we get is always $$$7$$$.In the third test case, it can be proven that the minimum possible value of $$$x$$$ is $$$19$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
3 3
...
...
...
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
3 3
###
#.#
###
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 3:
- **Input**:
```
1
2 2
..
..
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Where's My Water? (cf-2207-C)
- Difficulty: Hard
- Time Limit: 2s
- Memory Limit: 256MB

### Description:
```
Level 3 — David Luis Ortega, Where's My Water? Let $$$n, h$$$ be positive integers. Swampy the Alligator needs water for his bathtub, and you are tasked with getting it to him. Above his house, there is an $$$h \times n$$$ grid of dirt and water tiles with $$$n$$$ columns numbered $$$1, \ldots, n$$$. In column $$$i$$$, the bottom $$$a_i$$$ tiles are dirt, and the rest on top are water tiles.To get water to Swampy, you can place a drain on any tile that isn't a dirt tile. Placing a drain takes away all water tiles that can access the drain by moving only down, left, or right on the grid without crossing any dirt tiles.For example, placing the drain on the $$$\times$$$ in the grid below will drain both the top left and top right water tiles and result in $$$10$$$ tiles being drained:  What is the maximum amount of water you can get to Swampy after placing at most two drains? Note that water tiles that could have been taken by either drain are only counted once.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^3$$$). The description of the test cases follows. The first line contains two integers $$$n$$$ and $$$h$$$ ($$$1 \leq n \leq 2000, 1 \leq h \leq 10^9$$$) — the number of columns and height of the grid.The next line contains $$$n$$$ integers $$$a_i$$$ ($$$1 \leq a_i \leq h$$$) — the elevation of the dirt in column $$$i$$$.It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$2000$$$.

### Output Description
For each test case, output a single integer — the maximum number of water tiles that can be obtained with at most two drains.

### Note
In the first test case, the grid is the example shown in the statement. It is possible to drain $$$14$$$ tiles of water by placing the drains as shown:  In the second test case, the grid is shown below:  It is possible to drain all $$$43$$$ tiles of water by placing the drains as shown:  In the third test case, the grid is a single dirt tile, and no drains may be placed. So, the answer is $$$0$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Cyclists (cf-2208-B)
- Difficulty: Medium
- Time Limit: 1s
- Memory Limit: 256MB

### Description:
```
Bob likes to play an interesting tower defense game on his mobile phone. In the game, he must play cards to defeat his opponents!There are $$$n$$$ cards placed in a queue called a deck. At any moment, Bob is only able to play the cards that are currently placed in the first $$$k$$$ positions in the deck. In each turn, Bob selects a card placed in the first $$$k$$$ positions, removes it from the deck, plays it, and then places the same card back at the bottom of the deck. In other words, in each turn an element from the first $$$k$$$ elements in the queue is selected, moved to the end of the queue, and all elements placed after it are moved one index to the front.One card is called the win-condition, and Bob wants to play it as many times as possible. However, each card also has a cost needed to play. The $$$i$$$-th card (initially placed at the $$$i$$$-th position) costs Bob $$$a_i$$$ energy every time it is played. The total cost of cards played must not exceed $$$m$$$. Initially, the win-condition card is placed at the $$$p$$$-th place in the queue.You need to find out the maximum number of times the win-condition card can be played, ensuring that the total cost does not exceed $$$m$$$.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 5000$$$). The description of the test cases follows. The first line of each test case contains four integers $$$n,k,p,m$$$ ($$$1\le k,p\le n\le 5000$$$, $$$1\le m\le 5000$$$), denoting the number of cards, the number of cards that are playable at a time, the initial position of the win-condition, and the total energy available.The second line of each test case contains $$$n$$$ integers $$$a_1,a_2,\ldots,a_n$$$ ($$$1\le a_i\le m$$$) denoting the cost of each card.It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$5000$$$.

### Output Description
For each test case, output one integer in one line, denoting the maximum times the win-condition can be played.

### Note
In the first test case, we can only play the first card in the deck, and playing it will use all the energy. Since the win-condition is the second card, we can't play it before energy runs out. Therefore, the answer is $$$0$$$.In the second test case, we can play all the cards in the deck. The optimal strategy is obviously only playing the win-condition. Since it costs $$$1$$$ energy to play and we have $$$6$$$ energy in total, we can play it $$$6$$$ times before energy runs out. Therefore, the answer is $$$6$$$.In the third test case, we can play cards as follows: (the win condition is colored red)The initial deck is $$$[2,\color{red}{1},2]$$$.Play the first card: The deck becomes $$$[\color{red}{1},2,2]$$$.Play the first card again: The deck becomes $$$[2,2,\color{red}{1}]$$$.Play the first card once again: The deck becomes $$$[2,\color{red}{1},2]$$$.Play the second card: The deck becomes $$$[2,2,\color{red}{1}]$$$.In the process, we have played the win-condition for $$$2$$$ times, and we used $$$6$$$ energy in total. It can be shown that no strategy allows us to play the win-condition more than $$$2$$$ times with no more than $$$6$$$ points of energy; therefore, the answer is $$$2$$$.In the fourth test case, it can be shown that we can play the win-condition no more than once. This is achievable by always playing the $$$4$$$-th card in the deck. Therefore, the answer is $$$1$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
2
3
3 10
5 6
2 15
2
10 1
1 10
```
- **Expected Output**:
```
6
1
```

#### Testcase 2:
- **Input**:
```
1
2
4 5
3 8
```
- **Expected Output**:
```
5
```

#### Testcase 3:
- **Input**:
```
1
1
7 3
```
- **Expected Output**:
```
3
```

---

## Problem: Stamina and Tasks (cf-2208-C)
- Difficulty: Medium
- Time Limit: 2s
- Memory Limit: 256MB

### Description:
```
There are $$$n$$$ tasks for you. Task $$$i$$$ has an integer value of $$$c_i$$$ and a difficulty of $$$p_i$$$. Also, you have an initial stamina of $$$1$$$, which is denoted as $$$S$$$. You should process the tasks from task $$$1$$$ to task $$$n$$$. For each task, you have two choices.   Give up the task. This way, nothing will happen.  Complete the task. This way, you will gain $$$S\cdot c_i$$$ points. However, $$$S$$$ will drop to $$$S\cdot (1-\frac{p_i}{100})$$$ after the task is completed.  You need to maximize your points after you finish the process.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^3$$$). The description of the test cases follows. The first line of each test cases contain an integer $$$n$$$ ($$$1\le n\le10^5$$$) denoting the number of tasks.The following $$$n$$$ lines contain two integers each, denoting $$$c_i$$$ ($$$1\le c_i\le 100$$$) and $$$p_i$$$ ($$$0\le p_i\le 100$$$).It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$10^5$$$.

### Output Description
For each test case, output a single real number — the maximum possible points you can get. Your answer is considered correct if its absolute or relative error does not exceed $$$10^{-6}$$$.Formally, let your answer be $$$a$$$, and the jury's answer be $$$b$$$. Your answer is accepted if and only if $$$\frac{|a−b|}{\max(1,|b|)}\le 10^{-6}$$$.

### Note
In the first test case, it's optimal to complete task $$$1$$$ and $$$2$$$ in order, gaining points of $$$10+20=30$$$.In the second test case, it's optimal to complete task $$$1$$$, give up task $$$2$$$, and complete task $$$3$$$. Before completing task $$$3$$$, your stamina has dropped to $$$1-\frac{5}{100}=0.95$$$. So your gain is $$$10+20\cdot 0.95=29$$$ points in total.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
2
3 2
1 2 3
4 1
1 2 3 4
```
- **Expected Output**:
```
3
4
```

#### Testcase 2:
- **Input**:
```
1
5 3
2 1 4 3 5
```
- **Expected Output**:
```
5
```

#### Testcase 3:
- **Input**:
```
1
1 1
5
```
- **Expected Output**:
```
5
```

---

## Problem: Flip Flops (cf-2209-A)
- Difficulty: Easy
- Time Limit: 1s
- Memory Limit: 256MB

### Description:
```
OtterZ set up a battle with $$$n$$$ monsters in order to increase his combat power. Each monster has a combat power $$$a_i$$$ and OtterZ has a combat power of $$$c$$$. He has $$$k$$$ flip flops and can perform the following operations:   Kill an alive monster $$$i$$$ if $$$a_i \le c$$$; then $$$c$$$ becomes $$$c + a_i$$$.  Throw a flip flop at an alive monster $$$i$$$; the flip-flop will be broken and the monster will become angrier, then $$$a_i$$$ becomes $$$a_i + 1$$$.  Help OtterZ obtain the maximum possible $$$c$$$ after the battle.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 500$$$). The description of the test cases follows. The first line of each test case contains three integers $$$n$$$, $$$c$$$ and $$$k$$$ ($$$1 \le n \le 100$$$, $$$0 \le c,k \le 10 ^ 9$$$).The second line contains $$$n$$$ integers $$$a_1,a_2,\ldots,a_n$$$ ($$$0\le a_i\le 10 ^ 9$$$).

### Output Description
For each test case, output an integer — the maximum possible combat power.

### Note
In the first test,OtterZ found a strong monster and ran away, with combat power $$$12$$$.In the sixth test, OtterZ participated in the battle:   Throw $$$10$$$ flip flops to monster $$$2$$$, the combat power of monster $$$2$$$ turns to $$$12$$$.  Throw $$$10$$$ flip flops to monster $$$1$$$, the combat power of monster $$$1$$$ turns to $$$11$$$.  Kill monster $$$1$$$, OtterZ's combat power turns to $$$29$$$.  Throw $$$10$$$ flip flops to monster $$$5$$$, the combat power of monster $$$5$$$ turns to $$$12$$$.  Kill monster $$$2$$$, OtterZ's combat power turns to $$$41$$$.  Kill monster $$$5$$$, OtterZ's combat power turns to $$$53$$$.  OtterZ runs away with combat power $$$53$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
3
3
1 0 1
2
1 1
4
1 1 0 0
```
- **Expected Output**:
```
YES
YES
YES
```

#### Testcase 2:
- **Input**:
```
1
3
1 0 0
```
- **Expected Output**:
```
NO
```

#### Testcase 3:
- **Input**:
```
1
1
0
```
- **Expected Output**:
```
YES
```

---

## Problem: Array (cf-2209-B)
- Difficulty: Easy
- Time Limit: 1.5s
- Memory Limit: 256MB

### Description:
```
You are given an integer array $$$a$$$ of length $$$n$$$. For each index $$$i$$$, find the maximum number of indices $$$j$$$ such that $$$j  \gt  i$$$ and $$$|a_i - k|  \gt  |a_j - k|$$$, over all possible integer values of $$$k$$$.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 100$$$). The description of the test cases follows. The first line of each test case contains an integer $$$n$$$ ($$$1 \le n \le 5000$$$).The second line contains $$$n$$$ integers $$$a_1, a_2, \ldots, a_n$$$ ($$$-10^9 \le a_i \le 10^9$$$).It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$5000$$$.

### Output Description
For each test case, output $$$n$$$ integers denoting the answer.

### Note
In the second test, the answers are:   For $$$i=1$$$, you can choose $$$k=-195$$$, then $$$j=2$$$.  For $$$i=2$$$, you can choose $$$k=5$$$, there exists no index $$$j \gt i$$$. In the third test, the answers are:   For $$$i=1$$$, you can choose $$$k=195$$$, then $$$j=2,3,4,5$$$.  For $$$i=2$$$, you can choose $$$k=78$$$, then $$$j=3,4$$$.  For $$$i=3$$$, you can choose $$$k=15$$$, then $$$j=4,5$$$.  For $$$i=4$$$, you can choose $$$k=15$$$, then $$$j=5$$$.  For $$$i=5$$$, you can choose $$$k=998\,244\,353$$$, there exists no index $$$j \gt i$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
3
4
1 3 2 4
3
3 2 1
4
1 2 3 4
```
- **Expected Output**:
```
YES
YES
YES
```

#### Testcase 2:
- **Input**:
```
1
5
1 3 2 4 3
```
- **Expected Output**:
```
NO
```

#### Testcase 3:
- **Input**:
```
1
5
5 4 3 2 1
```
- **Expected Output**:
```
YES
```

---

## Problem: A Simple Sequence (cf-2210-A)
- Difficulty: Easy
- Time Limit: 1s
- Memory Limit: 256MB

### Description:
```
You are given an integer $$$n$$$. You need to construct a permutation$$$^{\text{∗}}$$$ $$$a_1, a_2, \ldots, a_n$$$ using integers from $$$1$$$ to $$$n$$$ such that the following condition is satisfied:$$$$$$ a_1 \bmod a_2 \ge a_2 \bmod a_3 \geq \ldots \ge a_{n-1} \bmod a_{n}, $$$$$$ where $$$u$$$ mod $$$v$$$ denotes the remainder of dividing $$$u$$$ by $$$v$$$.If multiple valid permutations exist, you may output any of them.It can be shown that a valid permutation always exists for every $$$n \ge 2$$$.$$$^{\text{∗}}$$$A permutation of length $$$n$$$ is an array consisting of $$$n$$$ distinct integers from $$$1$$$ to $$$n$$$ in arbitrary order. For example, $$$[2,3,1,5,4]$$$ is a permutation, but $$$[1,2,2]$$$ is not a permutation ($$$2$$$ appears twice in the array), and $$$[1,3,4]$$$ is also not a permutation ($$$n=3$$$ but there is $$$4$$$ in the array).

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 100$$$). The description of the test cases follows. The first line of each test case contains a single integer $$$n$$$ ($$$2 \le n \le 100$$$).

### Output Description
For each test case, output on a single line $$$n$$$ space-separated integers $$$a_1, a_2, \ldots a_n$$$.If multiple valid permutations exist, you may output any of them.

### Note
In the second test case, $$$2 \bmod 3 \ge 3 \bmod 1$$$, so the permutation $$$[2, 3, 1]$$$ is valid.In the third test case, $$$2 \bmod 4 \ge 4 \bmod 3 \ge 3 \bmod 1$$$, so the permutation $$$[2, 4, 3, 1]$$$ is valid.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
3
3 10
1 1
2 3
```
- **Expected Output**:
```
1 2 7
1
-1
```

#### Testcase 2:
- **Input**:
```
1
4 24
```
- **Expected Output**:
```
1 2 4 17
```

#### Testcase 3:
- **Input**:
```
1
1 5
```
- **Expected Output**:
```
5
```

---

## Problem: Simply Sitting on Chairs (cf-2210-B)
- Difficulty: Easy
- Time Limit: 1.5s
- Memory Limit: 256MB

### Description:
```
There are $$$n$$$ chairs in a row, initially all unmarked.You are given a permutation $$$p$$$$$$^{\text{∗}}$$$ of length $$$n$$$.Now, you play a game. You visit each chair sequentially, starting from the $$$1$$$-st chair. At the $$$i$$$-th chair, you can do the following:   If the $$$i$$$-th chair is already marked, then you end the game immediately without sitting on it.  Otherwise, you can choose to sit on the chair or skip it and move to the next chair.  If you choose to sit on the chair, then after standing up, you mark the $$$p_i$$$-th chair and move to the next chair.  If all the $$$n$$$ chairs are visited, the game ends.Your task is to determine the maximum number of chairs that you can sit on.$$$^{\text{∗}}$$$A permutation of length $$$n$$$ is an array consisting of $$$n$$$ distinct integers from $$$1$$$ to $$$n$$$ in arbitrary order. For example, $$$[2,3,1,5,4]$$$ is a permutation, but $$$[1,2,2]$$$ is not a permutation ($$$2$$$ appears twice in the array), and $$$[1,3,4]$$$ is also not a permutation ($$$n=3$$$ but there is $$$4$$$ in the array).

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. The first line of each test case contains a single integer $$$n$$$ ($$$1 \le n \le 2\cdot 10^5$$$) — the number of chairs.The second line of each test case contains $$$n$$$ distinct integers $$$p_1, p_2,\ldots,p_{n}$$$ — the permutation $$$p$$$.It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$2\cdot10^5$$$.

### Output Description
Output a single integer — the maximum number of chairs you can sit on.

### Note
In the first test case, you can proceed as follows:   You visit the $$$1$$$-st chair, sit on it, and mark the $$$3$$$-rd chair.  You visit the $$$2$$$-nd chair, sit on it, and mark the $$$2$$$-nd chair.  You visit the $$$3$$$-rd chair. Since it is marked, you end the game.  Therefore, using this sequence, you can sit on a total of $$$2$$$ chairs. It can be shown that the maximum number of chairs using any sequence of moves is $$$2$$$.In the second test case, you can proceed as follows:   You visit the $$$1$$$-st chair, sit on it, and mark the $$$4$$$-th chair.  You visit the $$$2$$$-nd chair and skip it.  You visit the $$$3$$$-rd chair, sit on it, and mark the $$$2$$$-nd chair.  You visit the $$$4$$$-th chair. Since it is marked, you end the game.  Therefore, using this sequence, you can sit on a total of $$$2$$$ chairs. It can be shown that the maximum number of chairs using any sequence of moves is $$$2$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
2
3
1 2
2 3
1 3
2
1 1
1 1
```
- **Expected Output**:
```
YES
NO
```

#### Testcase 2:
- **Input**:
```
1
4
1 4
1 4
1 4
1 4
```
- **Expected Output**:
```
YES
```

#### Testcase 3:
- **Input**:
```
1
2
2 2
1 1
```
- **Expected Output**:
```
YES
```

---

## Problem: A Simple GCD Problem (Easy Version) (cf-2210-C1)
- Difficulty: Medium
- Time Limit: 2s
- Memory Limit: 512MB

### Description:
```
This is the easy version of the problem. The difference between the versions is that in this version, $$$1 \leq n \leq 2 \cdot 10^{5}$$$ and $$$b_i = a_i$$$ for $$$1 \leq i \leq n$$$. Note that a solution for one version does not necessarily solve the other version. You can hack only if you solved all versions of this problem. You are given two arrays $$$a$$$ and $$$b$$$ of length $$$n$$$.For each index $$$i$$$ ($$$1 \le i \le n$$$) of array $$$a$$$, you can perform the following operation at most once:   choose an arbitrary integer $$$m$$$ ($$$\mathbf{m \neq a_i}$$$) such that $$$1 \leq m \le b_i$$$, and set $$$a_i := m$$$. Let the array after performing all the operations be $$$a'$$$. You can only perform operations in such a way that the following condition holds:   for all $$$1\leq l \lt r\leq n$$$, $$$\operatorname{gcd}(a_l,a_{l+1},\ldots,{a_r})=\operatorname{gcd}(a'_l,a'_{l+1},\ldots,a'_r).$$$ Here, $$$\gcd(x, y)$$$ denotes the greatest common divisor (GCD) of integers $$$x$$$ and $$$y$$$.   You have to determine the maximum number of operations that can be performed while ensuring that the condition remains satisfied.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. The first line of each test case contains an integer $$$n$$$ ($$$2 \leq n \leq 2\cdot 10^5$$$) — the length of $$$a$$$.The following line of each test case contains $$$n$$$ space-separated integers $$$a_1, a_2, \ldots, a_n$$$ ($$$1 \leq a_i \leq 10^9$$$).The next line of each test case contains $$$n$$$ space-separated integers $$$b_1, b_2, \ldots, b_n$$$ ($$$\color{red}{b_i = a_i}$$$).It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$2\cdot10^5$$$.

### Output Description
For each test case, output the maximum number of operations that can be done on a newline.

### Note
For the first test case, the GCD of all subarrays is $$$1$$$. Hence, we can perform $$$6$$$ operations and change the array to $$$a' = [1, 1, 1, 1, 1, 1, 1]$$$. It can be shown that the maximum number of operations that can be performed in this case is $$$6$$$.For the second test case, note that all the values are equal, and reducing any value causes the GCD of subarrays to decrease. Hence, $$$0$$$ operations can be performed.For the third test case, it can be shown that at most $$$2$$$ operations can be performed.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Mickey Mouse Constructive (cf-2211-B)
- Difficulty: Medium
- Time Limit: 1.5s
- Memory Limit: 256MB

### Description:
```
Given an array $$$a$$$, let $$$f(a)$$$ be the number of ways to partition $$$a$$$ into one or more subarrays$$$^{\text{∗}}$$$ such that:  Each element appears in exactly one subarray.  All subarrays have the same sum. For example, if $$$a=[1,1]$$$, then $$$f(a)=2$$$, because there are two such ways to partition $$$[1,1]$$$:  $$$[1,1]$$$, where the only subarray has sum $$$2$$$.  $$$[1]+[1]$$$, where both subarrays have sum $$$1$$$. You are given two integers $$$x$$$ and $$$y$$$. Find the minimum value of $$$f(a)$$$ over all arrays $$$a$$$ of length $$$x+y$$$, consisting of $$$x$$$ copies of the number $$$1$$$, and $$$y$$$ copies of the number $$$-1$$$ in some order. Since this answer may be large, output the answer modulo $$$676\,767\,677$$$. Additionally, you should construct one array that achieves this minimal value.$$$^{\text{∗}}$$$An array $$$b$$$ is a subarray of an array $$$c$$$ if $$$b$$$ can be obtained from $$$c$$$ by the deletion of several (possibly, zero or all) elements from the beginning and several (possibly, zero or all) elements from the end.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. The first line of each test case contains two integers $$$x$$$ and $$$y$$$ ($$$0 \leq x,y \leq 2\cdot 10^5$$$). It is guaranteed that $$$x+y \geq 1$$$.It is guaranteed that the sum of $$$x$$$ over all test cases does not exceed $$$2\cdot 10^5$$$, and the sum of $$$y$$$ over all test cases does not exceed $$$2\cdot 10^5$$$.

### Output Description
For each test case, output two lines: the minimum value of $$$f(a)$$$ over all valid arrays $$$a$$$ modulo $$$676\,767\,677$$$, and an example of an array that achieves the minimal result. Note you are minimizing $$$f(a)$$$, and taking that minimum value modulo $$$676\,767\,677$$$, not finding the minimal possible result of $$$f(a)$$$ mod $$$676\,767\,677$$$.

### Note
In the first test case, $$$x=2$$$ and $$$y=0$$$. The only possible array is $$$a=[1,1]$$$, with $$$f(a)=2$$$ as explained above.In the second case, $$$x=1$$$ and $$$y=1$$$. One possible array that minimizes $$$f(a)$$$ is $$$a=[1,-1]$$$, where $$$f(a)=1$$$ (as the only way to partition into subarrays with all subarrays having equal sum is $$$[[1,-1]]$$$).
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
3 2
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1 1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 3:
- **Input**:
```
1
4 0
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Equal Multisets (Easy Version) (cf-2211-C1)
- Difficulty: Medium
- Time Limit: 2s
- Memory Limit: 256MB

### Description:
```
This is the easy version of the problem. The difference between the versions is that in this version, the array $$$a$$$ is guaranteed to be a permutation. You can hack only if you solved all versions of this problem. Given an array $$$a$$$ of size $$$n$$$, and a parameter $$$k$$$, an array $$$b$$$ is called cool if the following conditions hold:  For each $$$i$$$ from $$$k$$$ to $$$n$$$, the array $$$[a_{i-k+1},a_{i-k+2},\ldots,a_i]$$$ is a rearrangement of $$$[b_{i-k+1},b_{i-k+2},\ldots,b_i]$$$. You are given two arrays $$$a$$$ and $$$b$$$ of size $$$n$$$, and an integer $$$k$$$. The array $$$a$$$ is guaranteed to be a permutation$$$^{\text{∗}}$$$. The array $$$b$$$ only contains integers from $$$1$$$ to $$$n$$$, and $$$-1$$$.Determine if it is possible to replace all $$$-1$$$ in $$$b$$$ with an integer from $$$1$$$ to $$$n$$$, such that $$$b$$$ is cool with respect to $$$k$$$.$$$^{\text{∗}}$$$A permutation of length $$$n$$$ is an array consisting of $$$n$$$ distinct integers from $$$1$$$ to $$$n$$$ in arbitrary order. For example, $$$[2,3,1,5,4]$$$ is a permutation, but $$$[1,2,2]$$$ is not a permutation ($$$2$$$ appears twice in the array), and $$$[1,3,4]$$$ is also not a permutation ($$$n=3$$$ but there is $$$4$$$ in the array).

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. The first line of each test case contains two integers $$$n$$$ and $$$k$$$ ($$$1 \leq k \leq n \leq 2\cdot 10^5$$$). The second line of each test case contains $$$n$$$ integers $$$a_1,a_2,\ldots,a_n$$$ ($$$1 \le a_i \le n$$$). In this version, it is guaranteed that each number from $$$1$$$ to $$$n$$$ appears exactly once.The third line of each test case contains $$$n$$$ integers $$$b_1,b_2,\ldots,b_n$$$ ($$$1 \leq b_i \leq n$$$ or $$$b_i=-1$$$).It is guaranteed that the sum of $$$n$$$ across all test cases does not exceed $$$2\cdot 10^5$$$.

### Output Description
For each test case, output YES if possible, and NO otherwise. You may print each letter in either uppercase or lowercase.

### Note
In the first test case, we have $$$k=5$$$. The only subarray of size $$$5$$$ is $$$[1,5]$$$. We can see that $$$b$$$ is a rearrangement of $$$a$$$, so the answer is YES.In the second test case, it can be shown that it is impossible to replace all $$$-1$$$ in $$$b$$$ such that every subarray of size $$$k=4$$$ are rearrangements of each other.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
3
1 2 3
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
4
1 1 2 2
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 3:
- **Input**:
```
1
2
5 5
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Course Wishes (cf-2216-A)
- Difficulty: Easy
- Time Limit: 1s
- Memory Limit: 256MB

### Description:
```
qwqkawaii is registering for $$$n$$$ ($$$n\le 50$$$) courses. In the registration system, he can submit a course wish for each course, which indicates his priority for taking that course.Course wishes are divided into $$$k+1$$$ ($$$k\le 20$$$) priority levels, where level $$$1$$$ is the highest priority and level $$$k+1$$$ is the lowest.The first $$$k$$$ wish levels have capacity limits: for each $$$1 \le i \le k$$$, at most $$$a_i$$$ courses can be assigned wish level $$$i$$$. Note that wish level $$$k+1$$$ has no capacity limit.Initially, the $$$i$$$-th course has wish level $$$b_i$$$, and it is guaranteed that this initial assignment satisfies all capacity limits. Now qwqkawaii wants to adjust all his courses to wish level $$$k + 1$$$. To achieve this, he can apply the following operation at most $$$1000$$$ times:  Select a course $$$i$$$ ($$$1\le i\le n$$$), then increase $$$b_i$$$ by $$$1$$$. Note that:  A course at level $$$k+1$$$ cannot be selected;  After every single operation, all capacity limits must still be satisfied. Your task is to construct a valid adjustment sequence with at most $$$1000$$$ operations, or report that it is impossible.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 50$$$). The description of the test cases follows. The first line of each test case contains two integers $$$n$$$ and $$$k$$$ ($$$1 \le n \le 50$$$, $$$1 \le k \le 20$$$) — the number of courses and the number of priority levels (excluding the lowest priority level).The second line contains $$$k$$$ integers $$$a_1, a_2, \ldots, a_k$$$ ($$$1 \le a_i \le n$$$) — the capacity limits of the first $$$k$$$ wish levels.The third line contains $$$n$$$ integers $$$b_1, b_2, \ldots, b_n$$$ ($$$1 \le b_i \le k+1$$$) — the initial wish levels of the courses. It is guaranteed that the initial assignment satisfies all capacity limits.

### Output Description
For each test case, if it is impossible to reach the target state, print a single integer $$$-1$$$.Otherwise, print the number of operations $$$m$$$ ($$$0 \le m \le 1000$$$) on the first line of output.Then print one line with $$$m$$$ integers $$$u_1, u_2, \ldots, u_m$$$ ($$$1 \le u_i \le n$$$), denoting that in the $$$i$$$-th operation, you increase the wish level $$$b_{u_i}$$$ of course $$$u_i$$$ by $$$1$$$.

### Note
In the first test case, initially, the wish levels are $$$[1, 2, 2]$$$. The capacity limits are $$$a_1=2$$$ and $$$a_2=2$$$. The operations are as follows:  Increase course $$$2$$$ to level $$$3$$$. Now the wish levels are $$$[1,3,2]$$$.  Increase course $$$1$$$ to level $$$2$$$. Now the wish levels are $$$[2,3,2]$$$.  Increase course $$$3$$$ to level $$$3$$$. Now the wish levels are $$$[2,3,3]$$$.  Increase course $$$1$$$ to level $$$3$$$. Now the wish levels are $$$[3,3,3]$$$, which matches the target. In the second test case, the initial state is already exactly the target state, so no operations are needed.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1 1
1
2
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1 1
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 3:
- **Input**:
```
1
3 2
1 2
3 3 3
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 4:
- **Input**:
```
1
3 2
1 2
1 2 3
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 5:
- **Input**:
```
1
2 1
1
1 1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: THU Packing Puzzle (cf-2216-B)
- Difficulty: Medium
- Time Limit: 1s
- Memory Limit: 256MB

### Description:
```
There are three types of 2D blocks: T-shaped, H-shaped, and U-shaped. Their exact shapes are shown in the figure below:You are given three non-negative integers $$$c_T$$$, $$$c_H$$$, and $$$c_U$$$, representing the numbers of T-shaped, H-shaped, and U-shaped blocks, respectively. Your task is to pack all $$$(c_T + c_H + c_U)$$$ blocks into an $$$n \times 3$$$ grid, following these rules:  Every block must be placed entirely inside the grid;  No two blocks may overlap (i.e., no unit cell can be covered by more than one block);  Blocks can be rotated by any multiple of $$$90^{\circ}$$$, but their edges must remain parallel to the grid borders. You have to find the minimum possible value of $$$n$$$ for which such a packing exists.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. The only line of each test case contains three integers $$$c_T$$$, $$$c_H$$$, and $$$c_U$$$ ($$$0\le c_T,c_H,c_U\le 10^9$$$, $$$c_T+c_H+c_U \gt 0$$$) — the numbers of T-shaped, H-shaped, and U-shaped blocks, respectively.

### Output Description
For each test case, output a single integer — the minimum possible value of $$$n$$$.

### Note
The optimal solutions for the first three test cases are listed below:
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
3 2
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1 1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 3:
- **Input**:
```
1
4 4
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: Flip the Bit (Easy Version) (cf-2217-B)
- Difficulty: Easy
- Time Limit: 1.5s
- Memory Limit: 256MB

### Description:
```
This is the easy version of the problem. The difference between the versions is that in this version, there is exactly one special index ($$$k=1$$$). You can hack only if you solved all versions of this problem. You are given a binary array $$$a$$$ of length $$$n$$$ and $$$k$$$ special indices $$$p_1, p_2, \ldots, p_k$$$ ($$$1 \le p_i \le n$$$). It is given that the values $$$a_i$$$ of all elements at special indices are the same (i. e., $$$a_{p_1} = a_{p_2} = \ldots = a_{p_k}$$$).In one operation, you can choose a range $$$[l, r]$$$ ($$$1 \le l \le r \le n$$$) such that the range contains at least one special index ($$$l \le p_i \le r$$$) and flip all bits $$$a_j$$$ for $$$l \le j \le r$$$. Flipping a bit changes $$$0$$$ to $$$1$$$ and $$$1$$$ to $$$0$$$.Let $$$x$$$ denote the value at special indices before any operations are applied. Find the minimum number of operations required to make all elements of the array equal to $$$x$$$.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. The first line of each test case contains two integers $$$n$$$ and $$$k$$$ ($$$1 \le n \le 2 \cdot 10^5$$$; $$$k=1$$$) — the length of the array and the number of special indices.The second line contains $$$n$$$ integers $$$a_1, a_2, \ldots, a_n$$$ ($$$0 \le a_i \le 1$$$) — the elements of the array.The third line contains $$$k$$$ integers $$$p_1, p_2, \ldots, p_k$$$ ($$$1 \le p_1  \lt  p_2  \lt  \ldots  \lt  p_k \le n$$$) — the special indices. It is guaranteed that $$$a_{p_1} = a_{p_2} = \ldots = a_{p_k}$$$.It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$2 \cdot 10^5$$$.

### Output Description
For each test case, output a single integer — the minimum number of operations required.

### Note
For the first test case, you can choose the range $$$[1, 3]$$$ and flip all the bits to get $$$[1, 0, 1]$$$. Then you can choose the range $$$[2, 2]$$$ and flip the second bit to get $$$[1, 1, 1]$$$.For the second test case, all the bits already match the value at the special index. You do not need any operations.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: The 67th 6-7 Integer Problem (cf-2218-B)
- Difficulty: Easy
- Time Limit: 1s
- Memory Limit: 256MB

### Description:
```
So, Macaque has passed his first challenge (and is not acknowledging your help whatsoever). After all, it was only given to him so he could engage in his greatest pleasure — crunching on desiccated freezedried hamburgers and yelling 'trivial' at the screen. However, he has another, much more important task ahead of him, and he has once again enlisted you to help him.You are given $$$7$$$ integers $$$a_1, a_2, \ldots, a_7$$$.You must negate $$$6$$$ out of the $$$7$$$ integers (that is, multiply them by $$$-1$$$). Over all possible ways to negate $$$6$$$ out of the $$$7$$$ integers, find the maximum possible sum of $$$a$$$.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 6767$$$). The description of the test cases follows.The first and only line of each test case contains $$$7$$$ space-separated integers $$$a_1, a_2, \ldots, a_7$$$ ($$$-67 \le a_i \le 67$$$).

### Output Description
For each test case, output the maximum sum of $$$a$$$ after negating $$$6$$$ out of the $$$7$$$ integers, on a new line.

### Note
In the first test case, no matter which $$$6$$$ integers we pick to negate, the maximum sum is $$$-41-41-41-41-41-41+41=-205$$$.In the second test case, we can negate all integers except $$$a_7$$$ to obtain a sum of $$$-6-9-4-20-6-7+67=15$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: The 67th Permutation Problem (cf-2218-C)
- Difficulty: Easy
- Time Limit: 2s
- Memory Limit: 256MB

### Description:
```
Upon arriving at school, Macaque was rather brusquely greeted by his friend, AG-88301, the latter having skived off his homework due to spending the entire night yapping to an unsuspecting stranger about his groundbreaking work on a proof of the Collatz conjecture and his $$$67$$$-th unreciprocated love interest. So, as had become customary, AG-88301, with ever decreasing levels of gratitude or appreciation, made Macaque do his homework for him. At this point, Macaque had had enough, and turned to his minions (you guys!) to solve AG-88301's homework task.You are given an integer $$$n$$$. You must construct a permutation$$$^{\text{∗}}$$$ of length $$$3n$$$ such that, if you partition the permutation into $$$n$$$ contiguous blocks with $$$3$$$ elements, the sum of the medians$$$^{\text{†}}$$$ of these blocks is maximised.More formally, you must construct a permutation $$$p$$$ of length $$$3n$$$ such that $$$\sum_{i=0}^{n-1}\operatorname{median}(a_{3i+1},a_{3i+2},a_{3i+3})$$$ is maximised. If there are multiple possible $$$p$$$, output any.$$$^{\text{∗}}$$$A permutation of length $$$n$$$ is an array consisting of $$$n$$$ distinct integers from $$$1$$$ to $$$n$$$ in arbitrary order. For example, $$$[2,3,1,5,4]$$$ is a permutation, but $$$[1,2,2]$$$ is not a permutation ($$$2$$$ appears twice in the array), and $$$[1,3,4]$$$ is also not a permutation ($$$n=3$$$ but there is $$$4$$$ in the array). $$$^{\text{†}}$$$The median of an array $$$b$$$ containing $$$3$$$ elements is the $$$2$$$-nd element after $$$b$$$ is sorted in non-decreasing order.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 10^4$$$). The description of the test cases follows. The first and only line of each test case contains an integer $$$n$$$ ($$$1 \leq n \leq 10^5$$$).It is guaranteed that the sum of $$$3n$$$ does not exceed $$$3 \cdot 10^5$$$ over all test cases.

### Output Description
For each test case, output a permutation $$$p$$$ such that the sum of the medians of the contiguous blocks is maximised. If there are multiple possible $$$p$$$, output any.

### Note
In the first test case, $$$[1,3,4,2,5,6]$$$ is a possible answer because $$$\operatorname{median}(1,3,4) + \operatorname{median}(2,5,6) = 3+5 = 8$$$, and it can be shown that $$$8$$$ is the maximal possible sum of medians.In the second test case, $$$[3,1,2]$$$ is a possible answer because the only achievable sum of medians when $$$n=1$$$ is $$$2$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: The 67th OEIS Problem (cf-2218-D)
- Difficulty: Medium
- Time Limit: 2s
- Memory Limit: 256MB

### Description:
```
Macaque, being a terrible problemsetter, decided to search for funny sequences on the OEIS$$$^{\text{∗}}$$$ one day, so he could gain inspiration for his doomed problemsetting job for the Pan-Mammalian Olympiad in Informatics (PMOI). To his delight, he found one, and thought it would be funny to make you, his loyal tester, solve it:Construct a sequence $$$a$$$ containing $$$n$$$ integers such that $$$\operatorname{gcd}(a_i, a_{i+1})$$$ $$$^{\text{†}}$$$ is distinct over all $$$1 \leq i \leq n - 1$$$. It is guaranteed that at least one sequence $$$a$$$ exists.$$$^{\text{∗}}$$$Online Encyclopedia of Integer Sequences, the favourite website of math nerds, overly astute testers, and insufficiently rigorous coordinators.$$$^{\text{†}}$$$$$$\operatorname{gcd}(x,y)$$$ refers to the greatest common divisor of integers $$$x$$$ and $$$y$$$.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 100$$$). The description of the test cases follows. The following $$$t$$$ lines contain one integer $$$n$$$ ($$$2 \leq n \leq 10^4$$$) — the desired length of the sequence. It is guaranteed the sum of $$$n$$$ over all test cases does not exceed $$$10^4$$$.

### Output Description
For each query, output your answer — a sequence $$$a$$$ of $$$n$$$ space-separated integers ($$$1 \le a_i \le 10^{18}$$$).

### Note
In the first test case, the sequence $$$[1, 6, 2]$$$ is a possible answer. This is because $$$\gcd(1, 6)$$$ is not equal to $$$\gcd(6, 2)$$$.In the second test case, the sequence $$$[134, 67, 69, 207, 414]$$$ is a possible answer. This is because the values of $$$\gcd(a_i, a_{i+1})$$$ for all $$$i$$$ between $$$1$$$ and $$$n-1$$$ are distinct. For reference, they are $$$67$$$, $$$1$$$, $$$69$$$ and $$$207$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

## Problem: The 67th XOR Problem (cf-2218-E)
- Difficulty: Medium
- Time Limit: 3s
- Memory Limit: 256MB

### Description:
```
The PMOI wasn't even that awful - word on the street was that the problems were decent, and even (heaven forbid) enjoyable! To Macaque's dismay, however, three unruly participants (Cloud, ChatGBT and Grook) started cheating using their perfect memory of the OEIS. What utter rapscallions! Suddenly, Macaque had to act fast, and devise a problem that these three could not feasibly cheat on. You, demoted from the rank of his companion to his wretched slave, have been enlisted to test.You are given an array $$$a$$$, initially containing $$$n$$$ non-negative integers.You perform the following operation exactly $$$n-1$$$ times:  Select an index $$$i$$$ of $$$a$$$ ($$$1 \leq i \leq |a|$$$, where $$$|a|$$$ denotes the current length of $$$a$$$). Let $$$x = a_i$$$.  Set $$$a_j = a_j \oplus x$$$ for all $$$1 \leq j \leq |a|$$$, where $$$\oplus$$$ denotes the bitwise XOR operation.  Remove $$$a_i$$$ from the array. It can be shown that after $$$n-1$$$ operations, exactly one element remains in the array. Your task is to determine the maximum possible value of this final remaining element if you perform the operations optimally.

### Input Description
Each test contains multiple test cases. The first line contains the number of test cases $$$t$$$ ($$$1 \le t \le 100$$$). The description of the test cases follows.The first line of each test case contains a single integer $$$n$$$ ($$$2 \le n \le 3105$$$) — the initial length of the array.The second line of each test case contains $$$n$$$ integers $$$a_1, a_2, \dots, a_n$$$ ($$$0 \le a_i \le 10^9$$$) — the elements of the array.It is guaranteed that the sum of $$$n$$$ over all test cases does not exceed $$$3105$$$.

### Output Description
For each test case, output a single integer — the maximum possible value of the final element.

### Note
In the second test case, the array is $$$[1, 2, 3]$$$. One optimal sequence of operations is:   Select the element $$$3$$$. Remove it. The remaining elements become $$$[1 \oplus 3, 2 \oplus 3] = [2, 1]$$$.  Select the element $$$2$$$. Remove it. The remaining element becomes $$$[1 \oplus 2] = [3]$$$.  The final value is $$$3$$$.
```

### Seeded Testcases:
#### Testcase 1:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

#### Testcase 2:
- **Input**:
```
1
1
```
- **Expected Output**:
```
CUSTOM_VALIDATED
```

---

