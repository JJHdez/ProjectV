# **PROJECT V** +  [Vuejs](https://vuejs.org) + [Material.io](https://material.io/) + [Flask](http://flask.pocoo.org/)
---

## Intro

Project V(violet) is a project that join all applications of use common
for everybody (end user, entrepreneur). One site, one app.

![Focus](screenshot/Focus.png)

Now only include this modules:

* [Goal]()
* [Habits]()
* [Pomodoro]()
* [Quick planning]()

## To check out living
visit [focus.yonn.xyz](https://focus.yonn.xyz)


## Contributing
#### Issue Reporting Guidelines
* Github issues

#### Pull Request Guidelines
* The master branch is basically just a snapshot of the latest stable release.
  All development should be done in dedicated branches.
  Do not submit PRs against the master branch.
* All submit PRs against the dev branch.
* Make your changes in a new git branch:
  ``git checkout -b my-fix-branch master``
* Commit your changes using a descriptive commit message and prefix:
    * ``imp `` for improvements
    * ``fix`` for bug fixes
    * ``ref`` for refactoring
    * ``add`` for adding new resources
    * ``rem`` for removing of resources

## Configuration
* Install libs python [requirements.txt](requirements.txt)
* Replace values in file ``flaskapp.cfg``
* Restore scripts SQL on [PostgreSQL](www.postgresql.org)
    * ``migrations/focusv2.0.sql``
    * ``migrations/focusv2.0.1.sql``
    * ``migrations/focusv2.0.2.sql``
* Create daemon Systemd replace values in the ``focus.service``



## License

Licensed under an [Apache-2.0](LICENSE) license.

Copyright © 2016-Present, ProjectV Authors. All Rights Reserved.