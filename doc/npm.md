# Resolution

```
{
  "dependencies": {
    "package-1": "2.3.1",   // has package-2 as dependency 
    "package-2": "3.1.7",
  }

  "resolutions": {
    // prevents package-1 to upgrade package-2
    // package-2 is locked to
    "package-2": "3.1.7"
   }
}
```

- **Avoiding Version Conflicts**: Resolving potential conflicts between dependencies by enforcing a
  specific version across the project.
- **Ensuring Consistency**: Ensuring that all developers working on the project use the same version
  of dependencies, leading to consistent behavior across different environments.
- **Simplified Dependency Management**: Making it easier to manage dependencies, especially in large
  projects, by reducing the chances of unexpected behavior due to version mismatches.
- **Faster Dependency Resolution**: Improving the installation speed of dependencies by reducing the
  need for npm to resolve version conflicts during installation.

# NPM config

```
~/.npmrc

prefix=/usr/local/.../nodejs
```
