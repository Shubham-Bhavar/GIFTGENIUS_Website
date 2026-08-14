/*
Question:
Given a string s where lowercase letters are at even indices
and digits are at odd indices, replace every digit with the
character obtained by shifting the previous character by
the value of that digit.

Example:
Input:  s = "a1c1e1"
Output: "abcdef"

Explanation:
'a' + 1 = 'b'
'c' + 1 = 'd'
'e' + 1 = 'f'
*/

class Solution {
    public String replaceDigits(String s) {

        char[] result = s.toCharArray();

        // Process every odd index
        for (int i = 1; i < result.length; i += 2) {

            // Convert digit character to integer
            int shift = result[i] - '0';

            // Shift the previous character
            result[i] = (char) (result[i - 1] + shift);
        }

        return new String(result);
    }
}
