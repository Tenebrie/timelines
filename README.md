# Running the app

The development environment requires Node, Yarn and Docker to run.

In most cases, the following commands are enough to have the entire environment up and running:

`yarn` <!-- Install dependencies -->
`yarn docker` <!-- Run containers -->
`yarn prisma migrate dev` <!-- Run migrations -->

The default admin user is `admin@localhost` with password `q`.

For a quick update on a running environment after a dependency update, change to Prisma types, creating a new migration, change to tsconfig.json or another change to package.json, use the following:

`yarn docker:update`

- Note: App should be running for this command to work.

To bring an older environment up-to-speed, or when something goes wrong, use the following command:

`yarn docker:fullinstall`

# Planned features:

This is a non-binding list of features that I am planning to add to Timelines at some point or another. They are likely sorted by priority, but order of implementation is not guaranteed.

## Character Map

An interactive, Miro-like board highlighting (and allowing the user to edit) connections and relationships between actors.

## Calendar v3

In the far future, calendar should receive a makeover to support completely custom time definitions. A day with different number of hours, a month with different number of days, and completely different labels to go with them.

Basically, a user can create a completely custom definition of their world's time system, and it should be reflected on the timeline.
