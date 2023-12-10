This readme is WIP

# Running the app

The development environment requires Node, Yarn and Docker to run.

In most cases, the following commands are enough to have the entire environment up and running:

`yarn`
`yarn docker`

For a quick update on a running environment after a dependency update, change to Prisma types, creating a new migration, change to tsconfig.json or another change to package.json, use the following:

`yarn docker:install`

- Note: App should be running for this command to work.

To bring an older environment up-to-speed, or when something goes wrong, use the following command:

`yarn docker:fullinstall`

# Planned features:

This is a non-binding list of features that I am planning to add to Timelines at some point or another. They are likely sorted by priority, but order of implementation is not guaranteed.

## Collaborative working

Currently the system supports collaborative working to a large degree. To make this a properly supported feature, a couple of things need to be added.

First, world sharing. As a user, I should be able to share my world with other users, and they should be able to access it from their world list. Shared worlds should not be deletable by anyone other than the original owner, but they can be unlinked from your own account.

Second, mutex locking. While one client (a user, or just a separate tab) is editing an event, a statement or anything else, it should be locked for all other users.

## Actors

Actors will be supported as a data type. An actor is a character, or an inanimate object with high story relevance. That may be a McGuffin, a powerful artifact the characters are hunting or some other entity important enough to get a dedicated page.

If your world had a wiki, and this character or item is important enough to have a dedicated wiki page, it should be an actor.

An actor will have the basic information associated with them (name, description, appearance, date of birth/creation), and will have access to special event types.

### Actor events
* **Birth/Creation**
  * True birth, regardless of the story presentation.
* **Stage enter**
  * Appearance of the actor in the story.
  * May be used multiple times, as the actor can leave and re-enter the stage.
* **Stage leave**
  * Disappearance of the actor from the story.
  * They may lose relevance temporarily or feign their death.
  * Can re-enter with a Stage enter event.
* **Death/Destruction**
  * True death or destruction of an actor.
  * They WILL NOT return after a true death.

## Calendar v3

In the far future, calendar should receive a makeover to support completely custom time definitions. A day with different number of hours, a month with different number of days, and completely different labels to go with them.

Basically, a user can create a completely custom definition of their world's time system, and it should be reflected on the timeline.

## The HOWs

The Higher Order Worlds are worlds with a special calendar type that has a much lower time resolution. Instead of 1 minute, it should be 1 year or more. These worlds will also allow the user to link to child projects on the timeline, as events with different event type. Clicking on such event will bring the user over to the target world's page.
The child world is loosely related to the parent. The "Home" link will be replaced with "Back to parent".
