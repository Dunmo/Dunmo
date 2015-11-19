# Development Processes

This document should contain all the information necessary to get started developing for Dunmo.

- [Feature Development](#feature-development)
- [Deployment](#deployment)
- [Tools](#tools)

## Feature Development

We are using [Gitflow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow) for this app.

The basic procedure for feature development is as follows:

- If there isn't a Github issue for this feature yet, create one using [Waffle](https://waffle.io/Dunmo/Dunmo)
- Move the card on [Waffle](https://waffle.io/Dunmo/Dunmo) to the "In Progress" list, and assign it to yourself if it's not already assigned to you
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

## Deployment

If you're on an Ubuntu machine, deployment is simple. Just run `bin/deploy` from the command line if you're in the project root.

For other operating systems, you'll need to build on the server.

The manual deployment process is as follows:

- Connect to the production server: `ssh root@dunmoapp.com`
- Ensure you have the latest versions of system packages: `sudo apt-get update && sudo apt-get upgrade && sudo apt-get autoclean`
- Ensure you have the latest LTS node version from https://nodejs.org: `node --version`
- Navigate to the git repository: `cd /home/dunmo/source`
- Update the remote git references: `git remote update -p`
- Checkout the branch you'd like to deploy, i.e. `git checkout origin/master`
- Build the bundle: `meteor build . --debug`
- Move the tar file: `mv -f source.tar.gz /home/dunmo/`
- Remove the backup bundle: `rm -rf /home/dunmo/archive/bundle`
- Move the current bundle to the archive: `mv /home/dunmo/bundle /home/dunmo/archive/`
- Navigate to the dunmo home directory `cd /home/dunmo/`
- Unpack the new bundle: `tar -zxf /home/dunmo/source.tar.gz`
- Install the npm packages: `cd /home/dunmo/bundle/programs/server && npm install`
- Restart the server instance: `stop dunmo; start dunmo`

## Tools

TODO

- Git
- Github
- Waffle.io
- Trello
- Toggl

## nginx

We are currently using nginx to manage our networking traffic.

The relevant files are in `/etc/nginx/sites-available` and `/etc/nginx/sites-enabled`

## upstart

The script to start dunmo is stored in `/etc/init/dunmo.conf`
