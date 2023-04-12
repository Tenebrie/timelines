Thie readme is WIP

# Planned features:

This is a non-binding list of features that I am planning to add to Timelines at some point or another. They are likely sorted by priority, but order of implementation is not guaranteed.

## Time picker

Event creation/editing should get a proper time picker widget.

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
