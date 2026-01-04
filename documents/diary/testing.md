# 7-29-2024

## Login Jest Testing

Today, I setup a basic testing scheme using jest. I simply tested login.tsx, from /components. In order to do so, I ended up also installing react native testing library. Overall, it was quite troublesome due to my lack of experience with testing, but I was able to get the basics setup. I learned a lot of skills, such as mocking, jest-setup, and calling jest directly. There will be a lot more testing in the future, so I'll try to take things incrementally.

## CI/CD

Today, I setup a very simple CI pipeline where the jest tests are run against any pull requests or commits. For the future, I also want to setup continuous deployment using EAS build as it can be easy for me to break the app on changes from code to build.
