
# Exploring the OT Collaborative Algorithm for Rich Text

The English abbreviation for `OT` is `Operational Transformation`, which is an algorithm used to handle collaborative editing. Currently, the `OT` algorithm is widely used in the field of rich text editors, often used as the underlying algorithm for implementing document collaboration, supporting multiple users to simultaneously edit documents without conflicts resulting from concurrent modifications, and avoiding inconsistent or lost data.

## Description
From its name, it can be seen that the focus of the `OT` collaborative algorithm is on the operations (`Operation`) and transformation (`Transformation`). Simply put, the operation (`Operation`) specifies that all operations must be atomic, such as inserting a character at position `N` or deleting a character at position `M`. All such operations must be atomic. The transformation (`Transformation`) specifies that all operations must have a transformation plan, for example, if I insert a character at position `N` and you simultaneously insert a character at `N+2`, assuming my operation is performed earlier, it must be transformed when executed on my local system, adjusting the insertion position based on the length of my insert. This is the general condition required by `OT`, and of course, the specific algorithm is much more complex, involving issues such as synchronization scheduling, `Undo/Redo`, cursor position, stability, traceability, and so on. This article does not delve into specific collaborative algorithms; it simply explores the basic idea of the `OT` collaborative algorithm. Currently, there are mature `OT` collaborative frameworks such as `ShareDB` that can be relatively easily integrated, although the cost is not low.

Before discussing specific collaborative algorithms, let's first explore why collaborative algorithms are needed, the problems that would arise without them, and the specific scenarios where problems would occur. So, if we have an online document application and we are a team, we may need to edit the same document. Since we may edit simultaneously, conflicts may arise. For instance, if the document content at a certain time is `A`, and users `U1` and `U2` are simultaneously editing, both starting from the `A` state, when `U1` finishes editing, the document state becomes `B`. After `U1` saves the document, `U2` also finishes, and the document state becomes `C`. So, at this point, the document state is `C`, and the changes made by `U1` from `A` to `B` are lost. To solve such problems, there are usually several approaches.

### Optimistic Locking
Optimistic locking is a concept contrasting with pessimistic locking. In optimistic locking, there is actually no participation of any locks in the process, strictly speaking, optimistic locking cannot be called a lock. Optimistic locking always assumes the best case scenario. Every time the data is retrieved, it assumes that no one else will modify it, so it does not lock. It may need to check whether there have been any updates to the data during a specific period of time when updating, or it may not provide any prompt.

In terms of document editing, we can optimistically assume that two people would never edit the same document simultaneously. This might be a realistic scenario, such as when each member of the team is only responsible for a few documents, and other team members do not need to or have the permission to edit documents outside their responsibility. Based on this requirement, we can optimistically assume that conflicts will never occur. Therefore, there is no need to impose any restrictions on document management; only complete editing capabilities need to be provided.

### Pessimistic Locking
Pessimistic locking, as the name suggests, is a preventive way to prevent all data conflicts with a pessimistic attitude. It locks the data before modifying it in a preventive manner, allowing reading and writing of the data. No one else can operate on the data until the lock is released. This way, the exclusivity and correctness of data can be fully ensured.

Regarding document editing, we can lock the editing permissions for the same document, ensuring that only one person can edit the document at a time, while others have to wait. When the first person completes the editing and releases the lock, the next person can then edit the document. Optionally, a mechanism can also be implemented to allow forced acquisition and storage of the scene being taken over, effectively converting concurrent operations into linear operations. This way, the document's correctness is ensured through exclusive access, avoiding conflicts and loss of content.

### Automatic Merging
Automatic merging, where document content is automatically merged and conflicts are handled, is another viable approach. It is similar to the version control concept in `Git`, enabling operations such as `diff` comparison and `merge` merging of submitted content. It can also prompt the user to handle unresolved conflicts when they arise. `GitBook` employs this method to resolve conflict issues.

### Collaborative Editing
Collaborative editing supports multiple users to edit a document simultaneously without conflicts, avoiding inconsistent or lost data due to concurrent user modifications. The key to collaborative editing is the collaborative algorithm, mainly including `Operational Transformation (OT)` and `Conflict-free Replicated DATA Type (CRDT)` algorithms. A collaborative algorithm does not need to be correct; it only needs to be consistent and must strive to maintain your intention. In other words, the main purpose of a collaborative algorithm is to provide eventual consistency while striving to maintain the user's intention. The focus is on providing eventual consistency, not maintaining the user's intention. Currently, `Quip`, `Tencent Docs`, `Feishu Docs`, and `Google Docs` are based on the `OT` collaborative algorithm, while the `Atom` editor uses the CRDT collaborative algorithm.

## OT Collaborative Algorithm
The core idea of the Operational Transformation (OT) collaborative algorithm is to consider every modification of a document as an operation, and then to transform these operations to merge them and ultimately obtain the document's content. The purpose of the OT algorithm is to maintain the final consistency of the document while preserving the user's intent as much as possible. For example, when both 'A' and 'B' insert different characters at position 'L' in the document, the collaborative algorithm does not care about the order of these insertions, it only needs to determine, based on a certain strategy such as a timestamp, whose character is inserted first. However, the final determination of who inserted the character first does not affect the collaborative algorithm. Its focus is on presenting the document content uniformly after the scheduling of user-generated 'Ops' using the collaborative algorithm, that is, maintaining the final consistency of the document. From a functional perspective, the collaborative algorithm ensures that in the case of multiple users editing online simultaneously, due to the different content submitted by each user, it is necessary to schedule through the collaborative algorithm so that each user can ultimately see the same content.

Before understanding the OT collaborative algorithm, we can also look into the main differences between the OT and CRDT collaborative algorithms. Firstly, both OT and CRDT provide eventual consistency, which is the ultimate goal of collaborative editing. However, these two approaches achieve this goal differently:

- OT achieves operation transformation through the transformation of operations, where each operation 'O' initiated at one terminal is transmitted over the network and is transformed at other terminals through 'T' before being applied to the document. The basic OT achieves convergence by transforming index positions.
- OT typically requires a central server for collaborative scheduling.
- OT handles edit conflicts through algorithms, which increases time complexity.
- On the other hand, CRDT achieves this through data structure. There are two implementation methods of CRDT: state-based CvRDT for convergent replicated data type and operation-based CmRDT for commutative replicated data type. CvRDT merges various replicas, and the number of merges or the order of merges is not important, as all replicas converge. CmRDT has commutative operations, so these operations can be correctly applied without the need for transformation.
- CRDT is more suitable for distributed systems and may not require a central server.
- CRDT guarantees conflict-free edits through data structure, increasing space complexity.

### Basic Principle
Returning to the OT collaboration we are introducing, we won't delve into the specific collaborative algorithm. Instead, our focus is on the motivation behind implementing OT, such as why collaboration isn't simply applying collaborators' 'Ops', why there is a need for operation transformation, how to carry out operation transformation, and when 'Ops' can be applied. When we understand the rationale and motivation behind a technology, its implementation may become clear. Here, we will start with the basic operations of 'A' and 'B' editing the same piece of text simultaneously, and explore what the OT collaboration does to maintain consistency. There are many ways to describe a document operation, and the classic 'Operation' includes the 'delta' model of 'quill', which describes the entire document using the 'retain', 'insert', and 'delete' operations, as well as the 'JSON' model of 'slate', which describes the entire document using operations such as 'insert_text', 'split_node', and 'remove_text'. Here, let's assume we have a 'Bold(start, end)' operation to make text bold, and an 'insert(position, content)' operation to describe the entire document.

Now, let's assume that the original text is '12', and users 'A' and 'B' each perform a bold operation and an insert operation.

- User 'A' performs a 'Bold(1, 2)' operation. First, 'A' needs to apply this operation locally, resulting in the local text being '(12)' to represent bold for simplicity.
- At the same time, user 'B' also performs an 'insert(2, "B")' operation. After applying this operation locally, 'B' local text becomes '12B'.
- At this point, the operations need to be synchronized. User 'A' receives 'insert(2, "B")' from user 'B'. After applying it locally from '(12)', 'A' has '(12)B'.
- User 'B' receives 'Bold(1, 2)' from user 'A'. After applying it locally from '12B', 'B' has '(12)B'.

It seems that there are no conflicts. In the end, both 'A' and 'B' have obtained consistent document content '(12)B'. However, the situation is not always this simple. Let's continue to see other scenarios. For simplicity, let's assume that there are only 'insert(position, content)' operations at the moment. From the definition, it's obvious that the function means to insert the 'content' at the 'position'. 

Now, let's assume that the original text is '123', and users 'A' and 'B' each perform an insert operation.

- User 'A' performs an 'insert(2, "A")' operation. After applying this operation locally, 'A' local text becomes '12A3'.
- At the same time, user 'B' also performs an 'insert(3, "B")' operation. After applying this operation locally, 'B' local text becomes '123B'.
- At this point, the operations need to be synchronized. User 'A' receives 'insert(3, "B")' from user 'B'. After applying it locally from '12A3', 'A' has '12AB3'.
- User 'B' receives 'insert(2, "A")' from user 'A'. After applying it locally from '123B', 'B' has '12A3B'.

The collaborative result mentioned above shows that user `A` sees the content as `12AB3`, while user `B` sees it as `12A3B`. The content is inconsistent, and the final consistency has not been successfully ensured. So, according to the name of `OT` - `Operational Transformation`, let's take a look at the collaboration we just did. We found that we only did the synchronization of `Operation`, but did not do the `Transformation`. This means that our approach is incomplete and, of course, cannot cover various `Cases` completely.

Now, let's look at the problems with the collaboration method above. In fact, we only applied the operations synchronized from other locations to our own local content. This operation loses the `Context`, also known as the context. Specifically, taking `A` as an example, when we receive the `insert(3, "B")` operation from `B`, this `Op` is actually based on the original text `123` as the context. However, at this point, our local text content is `12A3`, and executing `B`'s `Op` at this point results in a problem due to the lack of context. Therefore, we need the `OT` `Transformation` at this point to transform it. When a collaborator's change arrives, we need to transform the operation to adapt to the current context before we can apply it directly. The adjustment process is based on the changes that have already occurred in the document.

```
Ob' = OT(Oa, Ob)
Oa' = OT(Ob, Oa)
```

From the basic idea of the context mentioned above, we can derive the basic idea of `OT` collaboration, which is to transform each user's operation into an operation relative to the original text, thus ensuring final consistency. Specifically, assuming the initial state of the document is `S`, let's take the example of `A` user when we apply `Oa` - `insert(2, "A")` at the time of synchronization, and then we receive `B`'s `Ob` - `insert(3, "B")` operation. At this point, when we need to apply `Ob`, we need to transform it, i.e., `Ob' = OT(Oa, Ob)`. Note that at this point, we are passing `Oa` as a parameter, which means that we are calculating `Ob'` based on both `Oa` and `Ob`, and thus the context at this point is still `S`. Similarly, for `B`, when calculating the `Oa' = OT(Ob, Oa)` to be applied, the context at this point is also `S`. This way, the operation is transformed into operations relative to the original text, thereby ensuring consistency. In other words, `Ob' = OT(Oa, Ob)` is equivalent to undoing the previously executed `Oa` and then combining `Oa` and `Ob` to obtain `Ob'`, which are then applied to `S`. The same applies to `Oa' = OT(Ob, Oa`. At this point, regardless of whether `A` or `B` executes, the context is `S`, thereby ensuring consistency.

In concrete implementation, we need to define an algorithm to accomplish this `Transformation`. Here is a simple implementation: because the operations we defined are only `insert`, if we were to describe the document using the `retain`, `insert`, and `delete` operations mentioned above, then we would need to implement `3x3 = 9` different transformation operations. Here we transform the positions of two `insert` operations. If the position of the newly arrived `cur op` is after the previous `pre op`, it means that content has already been added to the original content, so we need to move the position of insertion back by the length of the text inserted by `pre op`.

```js
function transform(pre, cur) {
  // When inserting after `pre`, move the `position` where `cur` takes effect back
  if (pre.insert && cur.insert && pre.insert.position <= cur.insert.position) {
    return { 
        insert: { 
            position: cur.insert.position + pre.insert.content.length, 
            content: cur.insert.content 
        }
    };
  }
  // ...
  return cur;
}
```

Furthermore, as mentioned earlier, the ultimate goal of `OT` is to maintain final consistency. Therefore, let's say both of our `insert` operations are inserting different characters at position `2` at the same time. When transforming them, we need to determine who goes first because these two operations occur in the same timeframe and can be considered simultaneous. Thus, we must establish a strategy to decide which character goes first - we can do this by using the `ASCII` of the first character. This is just a simple strategy and is known as preserving the user's intent as much as possible while maintaining the final consistency of the document.

```js
// If the positions of the two 'inserts' are the same, then we need to decide who comes first based on the ASCII value of the first character.
if(pre.insert.position === cur.insert.position) {
    if(pre.insert.text.charCodeAt(0) < cur.insert.text.charCodeAt(0)) {
        return { 
            insert: { 
                position: cur.insert.position + pre.insert.content.length, 
                content: cur.insert.content 
            }
        };
    }
    return cur;
}
// A: 12  insert(2, A) 12A   oa
// B: 12  insert(2, B) 12B   ob
// A: 12A insert(3, B) 12AB  ob'
// B: 12B insert(2, A) 12AB  oa'
```

By applying the 'transform' function above, we can re-examine the example above. At this point, let's assume the original text is '123', and users 'A' and 'B' each performed an insertion operation.
- User 'A' performed an 'insert(2, "A")' operation, so locally 'A' applies this operation first, resulting in '12A3', which can be seen as inserting 'A' after '2'.
- User 'B' also performed an 'insert(3, "B")' operation, so locally 'B' applies this operation first, resulting in '123B', which can be seen as inserting 'B' after '3'.
- This requires the synchronization of 'Operations’. User 'A' received the 'insert(3, "B")' operation from User 'B', and after transforming 'transform(insert(2, "A"), insert(3, "B")) = insert(4, "B")', 'A' applies it to '12A3' and gets '12A3B'.
- User 'B' received the 'insert(2, "A")' operation from User 'A', and after transforming 'transform(insert(3, "B"), insert(2, "A")) = insert(2, "A")', 'B' applies it to '123B' and gets '12A3B’.

In the end, both 'A' and 'B' have '12A3B', achieving the final consistency of the operation. This is the basic principle of 'OT', so the typical diamond diagram that follows is easier to understand.

```
      S  
 Oa  / \  Ob
    /   \
    \   /
 Ob' \ /  Oa'
      T
```

### Ops
The previous example involved two parties performing a single 'Op' operation, but in reality, when we write documents, we most likely encounter multiple 'Op' operations. So, how does 'OT' handle the scenario of multiple 'Ops' occurring simultaneously? Firstly, the core idea of 'OT' remains unchanged - that is, 'Operational Transformation'. Therefore, our primary focus for handling multiple 'Ops' should be on how to 'transform'. 

Furthermore, upon first encountering 'OT', one might think that if there are multiple 'Ops', they could simply be merged into a single 'Op' for transmission. However, upon closer examination, it becomes apparent that this approach is not feasible. While some operations can indeed be combined, such as adding text at the same location, other operations cannot be merged, such as writing text at different locations. This would render the atomicity of 'Op', upon which collaboration relies, ineffective, subsequently causing issues with transformation and logical sequencing. 

Returning to the issue of transforming multiple 'Ops', if, for example, 'A' performs 'Oa1' and 'Oa2' operations and needs to apply 'B’s' 'Op' on the current basis, we face the challenge of potentially losing information from 'Oa1', leading to misinterpretations of the upcoming 'Ob''. The context for this transformation is not the original document content 'S', but rather the content 'S'' after applying 'Oa1', resulting in a content fork. To correct this issue, we should subject 'Ob' to two transformations, resulting in 'Ob'' = OT(Oa2, OT(Oa1, Ob))'. This process reverts the context back to 'S', ensuring the correct 'Op' operations can be immediately applied. In this example, the classic diamond diagram also represents the situation, and it's evident that as operations increase, the diamond will expand infinitely.

```
              S
        Oa1 /   \ Ob
           /     \ 
       /   \     /
  Oa2 / Ob' \   / Oa1'
      \     / 
  Ob'' \   / Oa2'
         T
```

So, why don't we summarize it again? Basically, when two `OP`s perform a `transform`, it's essentially one `OP` asking the other `OP` for information and adjusting itself based on that information. In this context, only the space information that originates from the same context and allows for mutual communication is reliable and understandable, and it's safe to use each other's information to adjust themselves. Therefore, we can conclude that:
* The premise for a transformation is that the two parameters to be transformed should originate from the same context. For example, in the case of `OT(Oa1, Ob)`, when `Ob'` is created, at that moment `Oa2` and `Ob'` have both undergone the operation `Oa1` and belong to the same context. Therefore, the transformation operation `OT(Oa2, Ob')` is also feasible.
* The application premise is that `Op` originates from the same context. For example, for `Ob''`, when it is about to be applied, we can trace its original context to position `S`, which is the initial state of the document. The initial states from which the operations `Oa1` and `Oa2` are generated are also `S`, making the application of `Ob''` feasible.

Now, if we make the example a bit more complex and say that both `A` and `B` have produced two `Op`s each, how should we handle it? In this case, we need to look for `OP`s that can perform `OT` and transform them one by one until the `OP` is transformed into the current context for use. Let's assume that `S(x,y)` represents the document status at position `(x,y)`, where `x, y` represent the states of clients `A` and `B`. `A(x,y)` represents the operation generated by client `A` in state `S(x,y)`, and `B(x,y)` represents the operation generated by client `B` in state `S(x,y)`. Therefore:

```
S(x,y) o A(x,y) = S(x+1,y)
S(x,y) o B(x,y) = S(x,y+1)
```

* The initial state of the document is `S(0,0)`.
* `A` performs operation `A(0,0)`, and the status is updated to `S(1,0)`, then it performs `A(1,0)`, and the status is updated to `S(2,0)`.
* `B` performs operation `B(0,0)`, and the status is updated to `S(0,1)`, then it performs `B(0,1)`, and the status is updated to `S(0,2)`.
* In `B`, `A(0,0)` is transformed based on `B(0,0)` to obtain `A(0,1)` applicable in state `S(0,1)`, resulting in `S(1,1)`.
* In `B`, `A(0,1)` is transformed based on `B(0,1)` to obtain `A(0,2)` applicable in state `S(0,2)`, resulting in `S(1,2)`.
* In `A`, `B(0,0)` is transformed based on `A(0,0)` to obtain `B(1,0)` applicable in state `S(1,0)`, resulting in `S(1,1)`.
* In `A`, `B(1,0)` is transformed based on `A(1,0)` to obtain `B(2,0)` applicable in state `S(2,0)`, resulting in `S(2,1)`.
* In `B`, `A(1,0)` is transformed based on `B(1,0)` to obtain `A(1,1)` applicable in state `S(1,1)`, resulting in `S(2,1)`.
* In `A`, `B(0,1)` is transformed based on `A(0,1)` to obtain `B(1,1)` applicable in state `S(1,1)`, resulting in `S(1,2)`.
* In `B`, `A(1,1)` is transformed based on `B(1,1)` to obtain `A(1,2)` applicable in state `S(1,2)`, resulting in `S(2,2)`.
* In `A`, `B(1,1)` is transformed based on `A(1,1)` to obtain `B(2,1)` applicable in state `S(2,1)`, resulting in `S(2,2)`.

It would be more intuitive to observe how the two parties are operating through a diagram. In reality, it's a series of rhombuses, but for illustration, it has been straightened. Both clients need to focus on the outermost two lines. However, in the above process and the diagram, it demonstrates a complete state transformation, and for the transformations of clients `A` and `B`, it's not necessary to complete all state transformations. For `A`, firstly, we need to transform `B(0,0)` with `A(0,0)` to derive `B(1,0)`, then transform `B(1,0)` with `A(1,0)` to derive `B(2,0)`, after that, transform `A(0,0)` with `B(0,0)` to derive `A(0,1)`, transform `A(1,0)` with `B(1,0)` to derive `A(1,1)`, next, transform `B(0,1)` with `A(0,1)` to derive `B(1,1)`, then, finally, transform `B(1,1)` with `A(1,1)` to derive `B(2,1)`, thus obtaining the two `Op - B(2,0) B(2,1)` needed for `S(2,0) -> S(2,2)`. Similarly, for `B`, it needs to transform `A(0,0)` with `B(0,0)` to derive `A(0,1)`, then transform `A(0,1)` with `B(0,1)` to derive `A(0,2)`, next, transform `B(0,0)` with `A(0,0)` to derive `B(1,0)`, transform `B(0,1)` with `A(0,1)` to derive `B(1,1)`, then transform `A(1,0)` with `B(1,0)` to derive `A(1,1)`, finally, transform `A(1,1)` with `B(1,1)` to derive `A(1,2)`, thus obtaining the two `Op - A(0,2) A(1,2)` needed for `S(0,2) -> S(2,2)`.

```
S(0,0) → A(0,0) → S(1,0) → A(1,0) → S(2,0)
   ↓                  ↓                  ↓
B(0,0)             B(1,0)             B(2,0)
   ↓                  ↓                  ↓
S(0,1) → A(0,1) → S(1,1) → A(1,1) → S(2,1)
   ↓                  ↓                  ↓
B(0,1)             B(1,1)             B(2,1)
   ↓                  ↓                  ↓
S(0,2) → A(0,2) → S(1,2) → A(1,2) → S(2,2)
```

For both `A` and `B`, we ultimately reached the state `S(2,2)`. Please note that the starting positions on the client side are `S(2,0)` and `S(0,2)`. Therefore, we cannot perform Operational Transformation (OT) based on `S(1,1)` for `A(1,0)` and `B(0,1)`. The actual applied operations are as follows, and all other states are just intermediate states.

```
A:
A(0,0) --> A(1,0) --> B(2,0) --> B(2,1)   
S(2,0) ο B(2,0) ο B(2,1) = S(2,1) ο B(2,1) = S(2,2)

B:
B(0,1) --> B(0,2) --> A(0,2) --> A(1,2)
S(0,2) ο A(0,2) ο A(1,2) = S(1,2) ο A(1,2) = S(2,2)
```

### Central Server
Previously, we discussed collaboration between two users and how to perform OT in the context of multiple Ops. In real-world applications, we also need a central server to collect, dispatch, and store Ops from various clients. These stored Ops represent a sequence of operations that can be continuously applied and used to describe the content of an entire document. The reliability and efficiency of the algorithms used by the server to schedule Ops will significantly affect the performance of our application.

Before examining collaboration with the involvement of a central server, let's consider why collaboration is so challenging and what causes it. If we were to forcefully synchronize multiple users' operations using a central server, meaning that all operations applied locally need to be verified by the server before being displayed, and all Ops are applied and synchronized with the client only after being applied on the server, similar to pessimistic locking but with automatic migration, we may not need a sophisticated scheduling algorithm, as it essentially ensures a synchronized lock. However, due to network delays, conflict issues could still arise, and the user experience would be particularly poor. In contrast, in normal collaboration, network transmission and the fact that "N" clients can apply Ops concurrently in the absence of complete synchronization contribute to the challenge of collaboration. Consequently, it is essential to design algorithms for scheduling, as this area also relates to the CAP theorem.

Returning to the scenario of OT collaboration with a central server, suppose we have "A," "B," and the server. We can effectively consider communication to be only between "A/B" and the server, with "A" and "B" not directly communicating. All clients communicate solely with the server to simplify the synchronization and conflict resolution process. In this context, it is necessary to design a scheduling strategy for the server. We can start with a simple approach where the server only handles conflicts without actually resolving them. If a conflict is detected, the server sends the conflicting parts back to the clients along with all Ops applied since the same starting point "S," allowing the clients to resolve the conflict and calculate the applied Ops before resubmitting them.

```markdown
According to the design above, let's do a deduction of the scenario. Assuming the initial state of the document is `S(0,0)`.
* The server has stored three operations of user `B`, namely `B(0,0)`, `B(0,1)`, `B(0,2)`, and the document state has progressed to `S(0,3)`.
* User `A` opened the document in state `S(0,0)` and performed four operations `A(0,0)`, `A(1,0)`, `A(2,0)`, `A(3,0)`, and the document state reached `S(4,0)`.
* At this time for the synchronization phase, when user `A` submitted the local operations `OpA 0-3` to the server, the document state at the server was `S(0, 3)`, while user `A`'s operations occurred in `S(0,0)` and couldn't be directly applied at the server. Therefore, the server did not accept these operations. Instead, the server gave user `A` the operations `B(0,0)`, `B(0,1)`, `B(0,2)` that occurred after `S(0,0)`, effectively providing all changes after `S(0,0)` to `A`. Because our server design doesn't handle conflicts, it requires `A` to perform operation transformation. After `A` completes the transformation, the operations can be submitted to the server again.
* After receiving the `OP` from the server, `A` performed `OT` and transformed `A(0,0) A(1,0) A(2,0) A(3,0)` based on `B(0,0) B(0,1) B(0,2)` to get `A(0,3) A(1,3) A(2,3) A(3,3)`. Since the server's state is `S(0,3)` at this point, equivalent to the context of `A(0,3)`, the server can directly apply it. Thus, `A` needs to revert the operations previously performed `A(0,0) A(1,0) A(2,0) A(3,0)`, then apply `B(0,0) B(0,1) B(0,2)`, and finally apply `A(0,3) A(1,3) A(2,3) A(3,3)`. At this point, the state reaches `S(4,3)`, simulating the `Ops` that the server needs to store.
* After `A` reached state `S(4,3)`, the server can accept `A(0,3) A(1,3) A(2,3) A(3,3)`. Since the server's state is `S(0,3)` at this point, equivalent to the context of `A(0,3)`, the server can directly apply it, thus reaching the state `S(4,3)`.
* Subsequently, the server synchronizes `A(0,3) A(1,3) A(2,3) A(3,3)` to client `B`, whose state is also `S(0,3)`, hence `B` can directly apply the operations. At this point, the states of all three parties reach `S(4,3)` and achieve final consistency.

This server design seems feasible, but let's imagine a scenario. If after `A` completes the operation transformation and attempts to submit again, the server has received new operations `B(0,4)` from user `B`, then `A`'s new operations are rejected again due to the mismatched context. In a collaborative and intensive multi-user application, such architecture is clearly not usable. In summary, the advantage of this design is that the server only checks for conflicts, which is simple to implement and ensures consistent operation order and good consistency. However, the downside is that in an intensive scenario, there’s a high likelihood of rejection and operations may be stuck locally, unable to be stored, and frequent execution of `OT` for rejected operations can block user editing. Therefore, this architecture has very limited support for collaborative users and is not usable.

Since the previous architecture design is not sufficient, let's make improvements to it. Since the server only dealing with conflicts but not resolving them is inadequate, we'll enable the server to resolve conflicts and allow clients to submit operations freely. Let's see what happens with this design based on the example above.

Assuming the initial state of the document is `S(0,0)`.
* The server has stored three operations of user `B`, namely `B(0,0)`, `B(0,1)`, `B(0,2)`, and the document state has progressed to `S(0,3)`.
* User `A` opened the document in state `S(0,0)` and performed four operations `A(0,0)`, `A(1,0)`, `A(2,0)`, `A(3,0)`, and the document state reached `S(4,0)`.
* At this point, `A` sent the `Ops` to the server, and the server performed `OT` at this time, and after storing the result, the server state also progressed to `S(4, 3)`.
* Now the server needs to make changes to `B`'s operations based on `A`, i.e., perform `OT` on `B(0,0) B(0,1) B(0,2)` based on `A(0,0) A(1,0) A(2,0) A(3,0)` to get `B(4,0) B(4,1) B(4,2)`, then send the `OT`-transformed `B` operations to `A`. After `A` applies the `Ops`, the state transitions from `S(4,0)` to `S(4,3)`.
* The server also needs to send `A(0,3) A(1,3) A(2,3) A(3,3)` to `B`, and the state transitions from `S(0,3)` to `S(4,3)`. At this point, the states of all three parties reach `S(4,3)` and achieve final consistency.
```

It seems that the design of this server is feasible. The main issue lies in the server handling conflict resolution and the distribution of `Op` instances. However, let's consider another scenario.

* If the server completes the `OT` for `B(4,0) B(4,1) B(4,2)` and returns it to `A`, while at the same time, `A` generates two new operations `A(4,0) A(5,0)`, then the local state of `A` advances to `S(6,0)`. In this case, the `OpB` received from the server cannot be applied locally.
* Therefore, an `OT` operation needs to be performed in `A`, transforming `B(4,0) B(4,1) B(4,2)` based on `A(4,0) A(5,0)` to obtain `B(6,0) B(6,1) B(6,2)`. Subsequently, `A` needs to apply `B(6,0) B(6,1) B(6,2)`, leading the state to transition from `S(6,0)` to `S(6,3)`.
* Afterwards, `A` needs to send `A(4,0) A(5,0)` to the server, followed by the completion of the server-side `OT` based on the previous process, resulting in `A(4,3), A(5,3)`. Ultimately, the states of all sides can reach the same state of `S(6,3)`.

In conclusion, the key feature of this architectural design is that when the server receives an `Op`, it detects conflicts. If there are no conflicts, it directly stores the operation, and if conflicts exist, it conducts server-side `OT` and sends the results to the client. When the client receives an `Op`, if there are no conflicts, it applies the operation directly; otherwise, it performs client-side `OT` and then applies the received `Op`. Based on the above example, it is apparent that for both `A` and `B`, the operations executed are actually inconsistent.

```
A: S(0,0) -> A(0,0) A(1,0) A(2,0) A(3,0) A(4,0) A(5,0) B(6,0) B(6,1) B(6,2) -> S(6,3)
B: S(0,0) -> B(0,0) B(0,1) B(0,2) A(0,3) A(1,3) A(2,3) A(3,3) A(4,3) A(5,3) -> S(6,3)
```

Therefore, this solution actually depends on `S o OpsA o OT(OpsA, OpsB) = S o OpsB o OT(OpsB, OpsA)`, adding complexity to the algorithm. The advantage of this design is that the server can handle conflicts, allowing the client to submit operations without being rejected. However, the downside is that the server needs to perform a large amount of `OT`, and the results of `OT` need to be sent to all clients. This design will put tremendous pressure on the server. In a densely populated collaborative environment, this design will only support a limited number of participants. If clients continuously submit `Op`, the server will be overwhelmed, and clients will not receive updates from others promptly. Furthermore, if `N` clients simultaneously send `Op`, the server will have to maintain an `N`-dimensional state vector during `OT`, which significantly increases the complexity of the process. As a result, this architecture would be impractical to implement.

At this point, let's consider an improvement to the solution. So far, we have been transforming and applying `Op` without considering any notion of temporal sequence. Earlier, we discussed order in terms of chronological order and conflict in terms of simultaneous editing. However, we can shift our understanding of simultaneity. Instead of focusing on simultaneous editing in time, we can now consider simultaneity in versions. In other words, we need something to represent each version, similar to the `Commit Id` in `git`, to indicate which version our modifications are based on when submitting to the server. A simple way to represent this is using incrementing numbers, providing us with a logical sequence rather than relying on timestamps for chronological order. Therefore, conflicts based on versions can be understood as submissions based on version `100`, leading to conflicts. Perhaps the submissions are not truly simultaneous; it's just a matter of whose submission reaches the backend first. However, one complex issue in this context is offline editing. For example, while the normal version has already reached `1000`, a user who was offline has a local version that has stayed at `100`. When submitting to the server, it is based on version `100`, which creates a significant bilaterally extended diamond in this case.

With the introduction of this notion of sequence, let's now revisit the specific design of the server and client. We can limit the frequency of client submissions. For simplicity, let's consider allowing only one `Op` to be submitted by the client each time. This way, after the server processes it and the client receives confirmation, only then can the client continue to send a second `Op`. At this point, we are using the logical time sequence, which is a monotonically increasing version number, to represent the context. Thus, we now have a few states. To simplify, during deduction, we use `Sending` and `Pending` to respectively signify waiting for confirmation and unsent `Op`.

At this point, the operator symbols we represent have changed. Assuming the initial version is `0`, and each change will increment the version number by `+1`, when the client submits `Op`, it needs to also include the version number to create the context of the operation for conflict detection. So, we use `Op(Index)` to represent the complete operation. For example, `A0(0)` represents `OpA0`, and the context of the operation (logical time sequence) is `0`, `B0(1)` represents `OpB0`, with the context of the operation being `1`.

- Client `A` locally generated two operations `A0(0)` and `A1(1)`.
- Client `B` locally generated one operation `B0(0)`.
- First, `B0(0)` is submitted to the server. At this point, `B0(0)` is in the `Sending` queue of client `B`. Since the server's `Op` sequence is empty at this point, `B0(0)` can be directly stored in the database. The server updates the version to `1` and sends `B0(0)` to other clients.
- The server sends `B0(0)` to other clients and then sends an `ACK` to `B`, notifying `B` that the `Op` has been confirmed. At this point, `B` dequeues `B0(0)` from the `Sending` queue and synchronizes the server's version to `1`.
- On client `A`, `A0(0)` is submitted. At this point, `A`'s `Sending` queue contains `A0(0)`, and the `Pending` queue contains `A1(1)`.
- After receiving `A0(0)`, the server's version number is greater than the received version number, detecting a conflict. The server performs `OT`, stores the obtained `A0'(1)`, updates the server's version to `2`, distributes `A0'(1)` to other clients, and returns an `ACK` for `A0` to client `A`.
- On client `A`, upon receiving the server's sent `B0(0)`, a conflict is detected. Based on `A0(0), A1(1)`, `B0(0)` is transformed to `B0'(2)`, and the local version is updated to `3`.
- Next, `A` receives the `ACK` for `A0'(1)`. At this point, the local version number has already reached `3`, but the confirmed server version in the `ACK` is `2`. In this case, we still maintain version `3`, `A` dequeues `A0(0)` from `Sending`, then submits `A1(1)` to the server, dequeues it from `Pending`, re-queues it to `Sending`. Of course, the pending `A1(1)` can also process the received `B0(0)`, then send the synchronized version number as an `ACK`, similar to resolving conflicts in advance.
- Similarly, after receiving the `ACK`, client `B` also updates its version to `1`. Subsequently, the arrival of `A0'(1)` can be directly applied, updating the local version to `2`.
- On the server, the current version is `2`, so the received `A1(1)` conflicts and requires an `OT` transformation. After obtaining `A1(2)'`, it is applied. The server updates the version to `3` and sends `A1(2)'` to other clients, and returns an `ACK` for `A1` to client `A`.
- After receiving `A1(2)'`, `B` can directly apply it and update the state to `3`.
- Upon receiving the `ACK` for `A1(2)'`, `A` dequeues `A1(1)` from `Sending` and updates the local version number to `3`. Now, every client and the server have reached a consistent version `3`.

The above implementation is closer to a real `OT` implementation scenario, based on the `ACK` mechanism. It not only limits the frequency of `Op` submissions but also conveniently represents the document context through a simple version number, avoiding the maintenance of an `N`-dimensional state vector. In a real implementation, such as in `ot.js`, three states control operations: `Synchronized` for an `Op` that is not currently being submitted and is awaiting a response, `AwaitingConfirm` for an `Op` that has been submitted and is awaiting confirmation, with no local editing data, and `AwaitingWithBuffer` for an `Op` that has been submitted and is awaiting confirmation, with local editing data. Subsequently, the handling of these three states is carried out. Specific implementations can be referenced in `https://github.com/Operational-Transformation/ot.js/blob/master/lib/client.js`, and there is also a visualized implementation at `http://operational-transformation.github.io/index.html`.

### Finally
In the above discussion, it may seem that we have arrived at a good solution. However, in reality, the content described is just the tip of the iceberg. A stable collaborative process still faces many issues, such as needing to support multi-user collaborative `Undo/Redo`, ensuring the unity of client and server `OT` algorithms, making trade-offs under the `CAP` theory, ensuring the performance of collaborative editors for multiple users, ensuring the stability and traceability of data, synchronous handling of cursors, and more. Indeed, there cannot be a perfect architectural design from the beginning, and it takes steps to make it perfect after identifying the issues.

With so much said, there are already many open-source `OT` algorithm implementations available. We do not need to focus specifically on the details of the implementation, although it's important to understand the fundamental theories. There are many mature frameworks available, such as `ot.js`, `ShareDb`, `ot-json`, `EasySync`, etc. However, due to the complexity of the scenario, even our integration requires a considerable amount of work. The article also mentions that specific `Transformations` need to be implemented. For open-source rich text engines, there are also many open-source implementations. Before integrating, it's important to conduct a thorough research. Otherwise, it's easy to feel overwhelmed. I particularly recommend reading the unit test part of the implementation to understand the scenarios and scope of `OT` algorithm processing. Here, I recommend two `OT` implementations, `https://github.com/ottypes/rich-text` based on `Quill` and `https://github.com/solidoc/slate-ot` based on `Slate`.

## Daily Question

```markdown
https://github.com/WindrunnerMax/EveryDay
```

## References

- [1] https://zhuanlan.zhihu.com/p/50990721
- [2] https://zhuanlan.zhihu.com/p/426184831
- [3] https://zhuanlan.zhihu.com/p/559699843
- [4] https://zhuanlan.zhihu.com/p/425265438
- [5] http://www.alloyteam.com/2020/01/14221/
- [6] http://www.alloyteam.com/2019/07/13659/
- [7] https://segmentfault.com/a/1190000040203619
- [8] https://www.shangyexinzhi.com/article/4676182.html
- [9] http://operational-transformation.github.io/index.html
- [10] https://xie.infoq.cn/article/a6fad791493bf4f698781d98e
- [11] https://github.com/yoyoyohamapi/book-slate-editor-design
- [12] https://www3.ntu.edu.sg/scse/staff/czsun/projects/otfaq/
```