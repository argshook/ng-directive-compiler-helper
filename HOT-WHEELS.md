# Hot Wheels

notes whtatodo


* [X] pass variables to driver methods
* [X] better approach to injecting driver since current way feels clumsy. Also, currently driver only works if all 4
arguments are given which is kinda shitty because if i don't need, say parentScopeMock, i still must give at least {}. That's shit
* [ ] should driver be a constructor rather than object literal?
* [X] pass `this` for driver methods so that other driver methods could be reused
* [ ] ~~hook element and scope objects on driver method context?~~
* [X] pass element reference automatically if no other args were passed to driver method
* [X] hook element onto driver method this as $

