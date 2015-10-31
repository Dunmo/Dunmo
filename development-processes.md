# Development Processes

This document should contain all the information necessary to get started developing for Dunmo.

- [Feature Development](#feature-development)
- [Tools](#tools)

## Feature Development

We are using [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) for this app.

The basic procedure for feature development is as follows:

- If there isn't a Github issue for this feature yet, create one using [Waffle](https://waffle.io/Dunmo/Dunmo)
- Move the card on [Waffle](https://waffle.io/Dunmo/Dunmo) to the "In Progress" list
- If you're using [Toggl](https://toggl.com), start your timer now
- Create a new git branch off of the `develop` branch using the convention `feature/123-short-name` where the number should match the github issue number
- If you're using TDD or BDD, write the spec first and consider edge cases
- Develop your feature, preferrably making many small commits, one for each file edit or atomic set of edits (See [Git Best Practices]() for more info)
- Once the feature is complete, squash commits if necessary and push to the remote
- Create a pull request on Github to merge the feature branch back into the `develop` branch
- If necessary, merge any new commits from the `develop` branch into your feature branch and resolve the conflict
- If you're using [Toggl](https://toggl.com), stop your timer
- Send a message to another developer to review your code
- Refactor as necessary, continuing to push new commits to the remote, and track your time on [Toggl](https://toggl.com) if desired
- When the feature looks good, your reviewer will merge the pull request and delete the remote branch

## Tools

TODO

- Git
- Github
- Waffle.io
- Trello
- Toggl
