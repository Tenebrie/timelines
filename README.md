# Running the app

The development environment requires Node, Yarn and Docker to run.

In most cases, the following commands are enough to have the entire environment up and running:

`yarn` <!-- Install dependencies -->
`yarn docker` <!-- Run containers -->
`yarn prisma:migrate:dev` <!-- Run migrations -->
`yarn db:seed` <!-- Create the default user -->

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

## The HOWs

The Higher Order Worlds are worlds with a special calendar type that has a much lower time resolution. Instead of 1 minute, it should be 1 year or more. These worlds will also allow the user to link to child projects on the timeline, as events with different event type. Clicking on such event will bring the user over to the target world's page.
The child world is loosely related to the parent. The "Home" link will be replaced with "Back to parent".
