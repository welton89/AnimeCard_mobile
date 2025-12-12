# Gun.js Complete Documentation

> Source: https://gun.eco/
> 
> **Note**: This documentation was compiled manually as the official site uses JavaScript to load content dynamically.

## About Gun.js

Gun.js is a decentralized, real-time database that works in both browsers and Node.js. It enables automatic data synchronization between peers without requiring a central server.

### Key Features

- **Decentralized**: No central server required
- **Real-time**: Automatic synchronization between peers
- **Offline-first**: Works without internet connection
- **Conflict Resolution**: Automatically resolves conflicts
- **Cross-platform**: Browser, Node.js, React Native
- **Small**: ~25KB gzipped
- **Fast**: Sub-20ms read/write operations

## Installation

```bash
# NPM
npm install gun

# Yarn
yarn add gun

# CDN
<script src="https://cdn.jsdelivr.net/npm/gun/gun.js"></script>
```

## Basic Setup

```javascript
// Node.js
const Gun = require('gun');
const gun = Gun();

// Browser
const gun = Gun();

// With peers (servers)
const gun = Gun(['http://localhost:8765/gun']);

// Multiple peers
const gun = Gun([
  'http://peer1.com/gun',
  'http://peer2.com/gun',
  'ws://peer3.com/gun'
]);
```

## Core API

### gun.get(key)
Gets a reference to a specific node.

```javascript
const user = gun.get('user/alice');
const data = gun.get('myapp/data');
```

### gun.put(data)
Stores data at the current node.

```javascript
gun.get('user/alice').put({
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
});

// Partial updates
gun.get('user/alice').put({ age: 31 });
```

### gun.on(callback)
Listens for real-time changes.

```javascript
gun.get('user/alice').on((data, key) => {
  console.log('Data updated:', data);
  console.log('Key:', key);
});
```

### gun.once(callback)
Listens only once (current value).

```javascript
gun.get('user/alice').once((data, key) => {
  console.log('Current data:', data);
});
```

### gun.off()
Removes listeners.

```javascript
const listener = gun.get('data').on(callback);
listener.off(); // Remove this specific listener
```

### gun.set(data)
Adds data to a set/list.

```javascript
const messages = gun.get('chat/messages');
messages.set({
  text: 'Hello world!',
  timestamp: Date.now(),
  user: 'alice'
});
```

### gun.map()
Iterates over all items in a set.

```javascript
gun.get('chat/messages').map().on((message, key) => {
  if (message) {
    console.log('Message:', message);
  }
});
```

## Advanced API

### Chaining
```javascript
gun.get('users')
   .get('alice')
   .get('profile')
   .put({ bio: 'JavaScript Developer' });

// Read with chaining
gun.get('users').get('alice').get('profile').on(data => {
  console.log('Profile:', data);
});
```

### References
```javascript
// Create references
const alice = gun.get('users/alice');
const bob = gun.get('users/bob');

// Alice follows Bob
alice.get('following').set(bob);

// List who Alice follows
alice.get('following').map().on((user, key) => {
  console.log('Alice follows:', user);
});
```

### gun.back()
Goes back one level in the chain.

```javascript
gun.get('users').get('alice').back(); // Returns gun.get('users')
```

### gun.opt(options)
Sets configuration options.

```javascript
const gun = Gun().opt({
  peers: ['http://server.com/gun'],
  localStorage: false,
  radisk: true
});
```

## Practical Examples

### Real-time Chat

```javascript
const gun = Gun(['ws://localhost:8765/gun']);
const messages = gun.get('chat');

// Send message
function sendMessage(text, username) {
  messages.set({
    text: text,
    user: username,
    timestamp: Date.now()
  });
}

// Receive messages
messages.map().on((data, key) => {
  if (data) {
    displayMessage(data);
  }
});

function displayMessage(msg) {
  console.log(`${msg.user} (${new Date(msg.timestamp)}): ${msg.text}`);
}

// Usage
sendMessage('Hello everyone!', 'Alice');
```

### User Management System

```javascript
const gun = Gun();

// Create user
function createUser(id, userData) {
  gun.get('users').get(id).put({
    ...userData,
    created: Date.now(),
    lastSeen: Date.now()
  });
}

// Get user
function getUser(id) {
  return new Promise((resolve) => {
    gun.get('users').get(id).once(resolve);
  });
}

// Update user
function updateUser(id, updates) {
  gun.get('users').get(id).put({
    ...updates,
    lastSeen: Date.now()
  });
}

// List all users
function listUsers(callback) {
  gun.get('users').map().on((user, key) => {
    if (user) {
      callback(user, key);
    }
  });
}

// Usage
createUser('alice', {
  name: 'Alice Silva',
  email: 'alice@example.com'
});

getUser('alice').then(user => {
  console.log('User:', user);
});
```

### Todo List Application

```javascript
const gun = Gun();
const todos = gun.get('todos');

// Add todo
function addTodo(text) {
  todos.set({
    text: text,
    completed: false,
    created: Date.now()
  });
}

// Toggle todo completion
function toggleTodo(todoRef, completed) {
  todoRef.put({ 
    completed: completed,
    updated: Date.now()
  });
}

// Delete todo
function deleteTodo(todoRef) {
  todoRef.put(null); // Set to null to delete
}

// List all todos
todos.map().on((todo, key) => {
  if (todo) {
    console.log(`${todo.completed ? '✓' : '○'} ${todo.text}`);
  }
});

// Usage
addTodo('Learn Gun.js');
addTodo('Build real-time app');
```

### Real-time Collaborative Document

```javascript
const gun = Gun();
const doc = gun.get('document/shared');

// Update document content
function updateDocument(content) {
  doc.put({
    content: content,
    lastModified: Date.now(),
    version: Date.now() // Simple versioning
  });
}

// Listen for document changes
doc.on((data) => {
  if (data) {
    displayDocument(data);
  }
});

function displayDocument(docData) {
  console.log('Document updated:', docData.content);
  console.log('Last modified:', new Date(docData.lastModified));
}

// Collaborative cursors
function updateCursor(userId, position) {
  gun.get('document/cursors').get(userId).put({
    position: position,
    timestamp: Date.now()
  });
}

// Listen for cursor updates
gun.get('document/cursors').map().on((cursor, userId) => {
  if (cursor) {
    console.log(`User ${userId} cursor at position:`, cursor.position);
  }
});
```

## Authentication with Gun/User

First install the SEA (Security, Encryption, Authorization) extension:

```bash
npm install gun/sea
```

```javascript
// Import SEA
require('gun/sea');

const gun = Gun();

// Create user account
gun.user().create('username', 'password', (ack) => {
  if (ack.err) {
    console.log('Error creating user:', ack.err);
  } else {
    console.log('User created successfully!');
  }
});

// Login
gun.user().auth('username', 'password', (ack) => {
  if (ack.err) {
    console.log('Login failed:', ack.err);
  } else {
    console.log('Login successful!');
    
    // Now you can access user's private data
    gun.user().get('profile').put({
      name: 'Alice',
      bio: 'Developer'
    });
  }
});

// Check if user is authenticated with sessionStorage
gun.user().recall({ sessionStorage: true }, (ack) => {
  if (ack.err) {
    console.log('Not authenticated');
  } else {
    console.log('User is authenticated:', gun.user().is);
  }
});

// Alternative: Simple recall (may not persist across sessions)
gun.user().recall((ack) => {
  if (ack.err) {
    console.log('Not authenticated');
  } else {
    console.log('User is authenticated:', gun.user().is);
  }
});

// Logout
gun.user().leave();
```

### Private Data

```javascript
// After authentication, store private data
gun.user().get('private').put({
  secretNote: 'This is private',
  apiKey: 'secret-key-123'
});

// Read private data
gun.user().get('private').on((data) => {
  console.log('Private data:', data);
});
```

## Server Setup

### Basic Node.js Server

```javascript
const Gun = require('gun');
const server = require('http').createServer();

const gun = Gun({
  web: server.listen(8765),
  peers: ['http://other-peer.com/gun']
});

console.log('Gun server running on port 8765');
```

### Express Integration

```javascript
const express = require('express');
const Gun = require('gun');

const app = express();
const server = require('http').createServer(app);

// Serve Gun
app.use(Gun.serve);

// Create Gun instance
const gun = Gun({ 
  web: server,
  peers: ['http://peer1.com/gun', 'http://peer2.com/gun']
});

// Serve static files
app.use(express.static('public'));

server.listen(8765, () => {
  console.log('Server running on port 8765');
});
```

### Production Server with Clustering

```javascript
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // Worker process
  const Gun = require('gun');
  const server = require('http').createServer();

  const gun = Gun({
    web: server.listen(8765),
    peers: process.env.GUN_PEERS ? process.env.GUN_PEERS.split(',') : []
  });

  console.log(`Worker ${process.pid} started`);
}
```

## Conflict Resolution

Gun.js uses CRDT (Conflict-free Replicated Data Type) algorithms for automatic conflict resolution:

### Last Write Wins
For simple values, the most recent write wins based on timestamps.

```javascript
// Peer A writes
gun.get('doc').put({ title: 'Title A' });

// Peer B writes later
gun.get('doc').put({ title: 'Title B' });

// Result: { title: 'Title B' } (last write wins)
```

### Object Merging
For objects, properties are merged automatically.

```javascript
// Peer A
gun.get('user').put({ name: 'Alice', age: 30 });

// Peer B (simultaneously)
gun.get('user').put({ name: 'Alice', email: 'alice@example.com' });

// Result: { name: 'Alice', age: 30, email: 'alice@example.com' }
```

### Custom Conflict Resolution

```javascript
// Using vector clocks for custom resolution
gun.get('counter').put((val, key, msg, ev) => {
  // Custom merge logic
  return (val || 0) + 1;
});
```

## Performance Optimization

### Batch Operations

```javascript
// Instead of multiple individual puts
gun.get('user').get('name').put('Alice');
gun.get('user').get('age').put(30);
gun.get('user').get('email').put('alice@example.com');

// Use single object put
gun.get('user').put({
  name: 'Alice',
  age: 30,
  email: 'alice@example.com'
});
```

### Memory Management

```javascript
// Remove listeners when not needed
const listener = gun.get('data').on(callback);
// Later...
listener.off();

// Use once() for one-time reads
gun.get('config').once((data) => {
  // Process data once
});
```

### Indexing

```javascript
// Create indexes for faster queries
function createIndex(collection, field) {
  gun.get(collection).map().on((item, key) => {
    if (item && item[field]) {
      gun.get(`${collection}_index_${field}`)
         .get(item[field])
         .set(gun.get(collection).get(key));
    }
  });
}

// Usage
createIndex('users', 'email');

// Query by index
gun.get('users_index_email')
   .get('alice@example.com')
   .once((userRef) => {
     userRef.once((user) => {
       console.log('Found user:', user);
     });
   });
```

## Debugging

### Enable Logging

```javascript
// Enable all logs
Gun.log = console.log;

// Log only once per event
Gun.log.once = true;

// Custom log levels
Gun.log = (msg, level) => {
  if (level === 'error') {
    console.error('Gun Error:', msg);
  }
};
```

### Inspect Data Structure

```javascript
// View complete data structure
gun.get('mydata').once((data, key) => {
  console.log('Complete data:', JSON.stringify(data, null, 2));
});

// Monitor all changes
gun.get('mydata').on((data, key, msg, ev) => {
  console.log('Change detected:', {
    data,
    key,
    message: msg,
    event: ev
  });
});
```

### Network Debugging

```javascript
// Monitor peer connections
gun.on('hi', (peer) => {
  console.log('Peer connected:', peer);
});

gun.on('bye', (peer) => {
  console.log('Peer disconnected:', peer);
});

// Check current peers
console.log('Current peers:', gun._.opt.peers);
```

## Best Practices

### 1. Data Structure Design

```javascript
// ✅ Good: Hierarchical structure
gun.get('app')
   .get('users')
   .get(userId)
   .get('profile')
   .put(profileData);

// ❌ Avoid: Flat structure with long keys
gun.get('app_users_' + userId + '_profile').put(profileData);
```

### 2. Use References

```javascript
// ✅ Good: Store references
const userRef = gun.get('users').get(userId);
userRef.get('name').put('Alice');
userRef.get('email').put('alice@example.com');

// ❌ Avoid: Repeating get() calls
gun.get('users').get(userId).get('name').put('Alice');
gun.get('users').get(userId).get('email').put('alice@example.com');
```

### 3. Handle Async Operations

```javascript
// ✅ Good: Promise wrapper
function gunGet(path) {
  return new Promise((resolve) => {
    gun.get(path).once(resolve);
  });
}

// Usage
const userData = await gunGet('users/alice');
```

### 4. Cleanup Listeners

```javascript
// ✅ Good: Store and cleanup listeners
const listeners = [];

function addListener(path, callback) {
  const listener = gun.get(path).on(callback);
  listeners.push(listener);
  return listener;
}

function cleanup() {
  listeners.forEach(listener => listener.off());
  listeners.length = 0;
}
```

## Common Patterns

### Pagination

```javascript
function getPaginatedData(collection, limit = 10, offset = 0) {
  const results = [];
  let count = 0;
  let skipped = 0;

  return new Promise((resolve) => {
    gun.get(collection).map().on((item, key) => {
      if (!item) return;
      
      if (skipped < offset) {
        skipped++;
        return;
      }
      
      if (count < limit) {
        results.push({ key, data: item });
        count++;
        
        if (count === limit) {
          resolve(results);
        }
      }
    });
  });
}
```

### Search/Filter

```javascript
function searchUsers(query) {
  const results = [];
  
  gun.get('users').map().on((user, key) => {
    if (user && user.name && user.name.toLowerCase().includes(query.toLowerCase())) {
      results.push({ key, user });
    }
  });
  
  return results;
}
```

### Caching

```javascript
const cache = new Map();

function getCached(path, ttl = 60000) {
  const cached = cache.get(path);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return Promise.resolve(cached.data);
  }
  
  return new Promise((resolve) => {
    gun.get(path).once((data) => {
      cache.set(path, {
        data,
        timestamp: Date.now()
      });
      resolve(data);
    });
  });
}
```

## Configuration Options

```javascript
const gun = Gun({
  // Peer connections
  peers: ['http://server.com/gun'],
  
  // Disable localStorage
  localStorage: false,
  
  // Enable radisk (faster disk storage)
  radisk: true,
  
  // Custom storage adapter
  store: customStorageAdapter,
  
  // WebSocket configuration
  ws: {
    noServer: true
  },
  
  // HTTP server
  web: httpServer,
  
  // Custom UUID function
  uuid: () => customUuidGenerator(),
  
  // Batch size for synchronization
  batch: 1000,
  
  // Connection timeout
  timeout: 30000
});
```

## Useful Links

- **Official Website**: https://gun.eco/
- **GitHub Repository**: https://github.com/amark/gun
- **NPM Package**: https://www.npmjs.com/package/gun
- **Documentation**: https://gun.eco/docs/
- **Examples**: https://github.com/amark/gun/tree/master/examples
- **Community Chat**: https://gitter.im/amark/gun
- **Stack Overflow**: https://stackoverflow.com/questions/tagged/gun.js

---

*This documentation covers the essential concepts and APIs of Gun.js. For the most up-to-date information, always refer to the official documentation at gun.eco*
---


## React Native Integration

### Official React Native Example

Based on the official Gun.js repository example for React Native integration:

```javascript
import * as React from 'react';
import {View, StyleSheet, TextInput, Text, TouchableOpacity, AsyncStorage} from 'react-native';
import Gun from 'gun/gun';
import 'gun/lib/open';
import '../extensions/sea';
import adapter from '../extensions/asyncStorageAdapter';

// Register AsyncStorage adapter
Gun.on('create', function(db) {
  this.to.next(db);
  
  const pluginInterop = function(middleware) {
    return function(request) {
      this.to.next(request);
      return middleware(request, db);
    };
  };

  // Register the adapter for read/write operations
  db.on('get', pluginInterop(adapter.read));
  db.on('put', pluginInterop(adapter.write));
});

export class Demo extends React.Component {
  constructor() {
    super();
    this.gun = new Gun();
    this.user = this.gun.user();
    
    // Global access for debugging
    window.gun = this.gun;
    window.user = this.user;
    
    this.state = {
      authenticated: false,
      list: [],
      listText: '',
      username: '',
      password: '',
    };
  }

  // Hook into user's list with real-time updates
  hookUserList = () => {
    this.user.get('list').open((list) => {
      const userList = Object.keys(list).reduce((newList, key) => {
        if (!!Object.keys(list[key]).length) {
          return [...newList, {text: list[key].text, key}];
        }
      }, []);
      
      this.setState({
        list: userList || [],
      });
    });
  }

  addToList = () => {
    this.user.get('list').set({text: this.state.listText});
  }

  doSignin = () => {
    this.user.auth(this.state.username, this.state.password, (d) => {
      if (d.err) {
        console.log('Authentication error:', d.err);
        return;
      }
      
      this.setState({authenticated: true});
      this.hookUserList();
    });
  }

  doSignup = () => {
    this.user.create(this.state.username, this.state.password, () => {
      this.doSignin();
    });
  }

  render() {
    return (
      <View style={styles.container}>
        {this.state.authenticated ? 
          this.userListScreen() : 
          this.loginScreen()
        }
      </View>
    );
  }
}
```

### Key React Native Concepts

#### 1. **AsyncStorage Adapter**
Gun.js requires a custom adapter to work with React Native's AsyncStorage:

```javascript
// asyncStorageAdapter.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const adapter = {
  read: async (request, db) => {
    const key = request.get;
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : undefined;
    } catch (error) {
      console.error('AsyncStorage read error:', error);
      return undefined;
    }
  },

  write: async (request, db) => {
    const key = request.put;
    const data = request.put;
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('AsyncStorage write error:', error);
      return false;
    }
  }
};

export default adapter;
```

#### 2. **Plugin Registration**
Register the AsyncStorage adapter using Gun's plugin system:

```javascript
Gun.on('create', function(db) {
  this.to.next(db);
  
  const pluginInterop = function(middleware) {
    return function(request) {
      this.to.next(request);
      return middleware(request, db);
    };
  };

  // Register read/write operations
  db.on('get', pluginInterop(adapter.read));
  db.on('put', pluginInterop(adapter.write));
});
```

#### 3. **Real-time Data Binding**
Use `.on()` for real-time updates (official API):

```javascript
// Real-time list updates with .map().on()
this.user.get('list').map().on((item, key) => {
  if (item) {
    // Update state with new item
    this.setState(prevState => ({
      list: [...prevState.list.filter(l => l.key !== key), {text: item.text, key}]
    }));
  }
});

// Alternative: Direct object listening
this.user.get('profile').on((profile) => {
  if (profile) {
    this.setState({profile});
  }
});
```

**Note**: `.open()` appears in some examples but is not part of the core API. Use `.on()` for reliable real-time updates.

#### 4. **Authentication Flow**
Proper authentication handling for React Native:

```javascript
// Create user
this.user.create(username, password, (ack) => {
  if (ack.err) {
    console.log('Create error:', ack.err);
    return;
  }
  // Auto-login after creation
  this.doSignin();
});

// Login user
this.user.auth(username, password, (ack) => {
  if (ack.err) {
    console.log('Auth error:', ack.err);
    return;
  }
  
  this.setState({authenticated: true});
  this.hookUserList();
});
```

### React Native Best Practices

#### 1. **Import Structure**
```javascript
import Gun from 'gun/gun';           // Core Gun
import 'gun/lib/open';              // Real-time updates
import 'gun/sea';                   // Authentication
import adapter from './asyncStorageAdapter';
```

#### 2. **Component Integration**
```javascript
class MyComponent extends React.Component {
  constructor() {
    super();
    this.gun = new Gun();
    this.user = this.gun.user();
  }

  componentDidMount() {
    // Setup real-time listeners
    this.setupGunListeners();
  }

  componentWillUnmount() {
    // Cleanup listeners
    this.gun.off();
  }
}
```

#### 3. **State Management**
```javascript
// Use React state for UI updates
hookUserData = () => {
  this.user.get('profile').open((profile) => {
    this.setState({profile});
  });
}

// Update data through Gun
updateProfile = (newData) => {
  this.user.get('profile').put(newData);
  // State will update automatically via .open()
}
```

#### 4. **Error Handling**
```javascript
// Always handle Gun errors
this.user.auth(username, password, (ack) => {
  if (ack.err) {
    // Handle specific errors
    if (ack.err.includes('Wrong user or password')) {
      this.setState({error: 'Invalid credentials'});
    } else if (ack.err.includes('User not found')) {
      this.setState({error: 'User does not exist'});
    }
    return;
  }
  
  // Success handling
  this.setState({authenticated: true, error: null});
});
```

### React Native Configuration

#### 1. **Metro Configuration**
Add to `metro.config.js`:

```javascript
module.exports = {
  resolver: {
    alias: {
      'gun': 'gun/gun.js',
    },
  },
};
```

#### 2. **Package Dependencies**
```json
{
  "dependencies": {
    "gun": "^0.2020.1241",
    "@react-native-async-storage/async-storage": "^1.19.0"
  }
}
```

#### 3. **Android Permissions**
Add to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### Common React Native Issues

#### 1. **Metro Bundler Issues**
```bash
# Clear Metro cache
npx react-native start --reset-cache

# Or for Expo
expo start -c
```

#### 2. **AsyncStorage Deprecation**
Use `@react-native-async-storage/async-storage` instead of deprecated `AsyncStorage`:

```javascript
// Old (deprecated)
import {AsyncStorage} from 'react-native';

// New (recommended)
import AsyncStorage from '@react-native-async-storage/async-storage';
```

#### 3. **WebSocket Issues**
For React Native, ensure WebSocket support:

```javascript
// Add to index.js or App.js
import 'react-native-get-random-values';

// For older RN versions
global.WebSocket = global.WebSocket || require('ws');
```

### Performance Optimization

#### 1. **Lazy Loading**
```javascript
// Load Gun.js lazily
const initGun = async () => {
  const Gun = await import('gun/gun');
  await import('gun/sea');
  return new Gun();
};
```

#### 2. **Memory Management**
```javascript
componentWillUnmount() {
  // Always cleanup Gun listeners
  if (this.gun) {
    this.gun.off();
  }
}
```

#### 3. **Batch Operations**
```javascript
// Batch multiple updates
const updates = {
  name: 'John',
  age: 30,
  email: 'john@example.com'
};

this.user.get('profile').put(updates);
```

---
### User.
recall

Recall saves a user's credentials in sessionStorage of the browser. As long as the tab of your app is not closed the user stays logged in, even through page refreshes and reloads.

```javascript
var gun = Gun(); 
var user = gun.user().recall({sessionStorage: true});
```

#### Syntax
```javascript
user.recall(opt, cb)
```

#### Parameters
- **opt** (object) - option object
  ```javascript
  {
    sessionStorage: true // use the browser storage to keep credentials
  }
  ```
- **cb** (function) - callback function

#### Example Usage
```javascript
// Initialize Gun and user
var gun = Gun();
var user = gun.user();

// Recall with sessionStorage for persistence
user.recall({ sessionStorage: true }, (ack) => {
  if (ack.err) {
    console.log('No saved session found');
    // Show login form
  } else {
    console.log('User session restored:', user.is);
    // User is logged in, update UI
  }
});
```

#### Best Practices
1. **Always call on app initialization** to restore user sessions
2. **Use sessionStorage: true** for proper persistence
3. **Handle both success and error cases** in the callback
4. **Update UI state** based on authentication status

#### React Native Considerations
For React Native, the sessionStorage option works with the AsyncStorage adapter:

```javascript
// In React Native with AsyncStorage adapter
gun.user().recall({ sessionStorage: true }, (ack) => {
  if (ack.err) {
    console.log('No session in AsyncStorage');
  } else {
    console.log('Session restored from AsyncStorage');
  }
});
```
### User.is

To check if you are currently logged in:

```javascript
if (user.is) {
    console.log('You are logged in');
} else {
    console.log('You are not logged in');
}
```

If the user is not logged in it will return `undefined`.

#### Example Usage
```javascript
var gun = Gun();
var user = gun.user();

// Check authentication status
if (user.is) {
    console.log('User is authenticated:', user.is.alias);
    console.log('User public key:', user.is.pub);
} else {
    console.log('User is not authenticated');
    // Show login form
}
```

#### Properties Available When Authenticated
When `user.is` returns a truthy value, it contains:
- `alias` - The username
- `pub` - Public key
- `epub` - Encrypted public key

#### React Example
```javascript
function AuthStatus() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [username, setUsername] = useState('');
    
    useEffect(() => {
        const checkAuth = () => {
            if (gun.user().is) {
                setIsLoggedIn(true);
                setUsername(gun.user().is.alias);
            } else {
                setIsLoggedIn(false);
                setUsername('');
            }
        };
        
        checkAuth();
        
        // Check periodically or on events
        const interval = setInterval(checkAuth, 1000);
        return () => clearInterval(interval);
    }, []);
    
    return (
        <div>
            {isLoggedIn ? (
                <p>Welcome, {username}!</p>
            ) : (
                <p>Please log in</p>
            )}
        </div>
    );
}
```