#!/usr/bin/env bash
#
# Superpowers Installation Script
# 
# This script installs Superpowers globally to ~/.agents/superpowers
# and optionally updates project instruction files.
#
# Usage:
#   curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh | bash
#   
# Or download and inspect first:
#   curl -fsSL https://raw.githubusercontent.com/complexthings/superpowers/main/install.sh -o install.sh
#   bash install.sh

set -euo pipefail

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Installation configuration
INSTALL_DIR="$HOME/.agents/superpowers"
REPO_URL="https://github.com/complexthings/superpowers.git"
BACKUP_SUFFIX=".backup-$(date +%Y-%m-%d-%H%M%S)"

# Cleanup function for error handling
cleanup_on_error() {
  local exit_code=$?
  if [ $exit_code -ne 0 ]; then
    echo -e "${RED}✗ Installation failed${NC}"
    if [ -d "$INSTALL_DIR/.git" ] && [ ! -f "$INSTALL_DIR/.install_success" ]; then
      echo -e "${YELLOW}Cleaning up incomplete installation...${NC}"
      rm -rf "$INSTALL_DIR"
    fi
  fi
  exit $exit_code
}

trap cleanup_on_error EXIT

# Helper functions
log_info() {
  echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
  echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

# Detect platform
detect_platform() {
  local os_type
  os_type=$(uname -s)
  
  case "$os_type" in
    Darwin*)
      echo "macos"
      ;;
    Linux*)
      echo "linux"
      ;;
    MINGW*|MSYS*|CYGWIN*)
      echo "windows"
      ;;
    *)
      echo "unknown"
      ;;
  esac
}

# Detect user's shell profile file
detect_shell_profile() {
  local shell_name
  shell_name=$(basename "$SHELL")
  
  case "$shell_name" in
    zsh)
      echo "$HOME/.zshrc"
      ;;
    bash)
      # On macOS, bash uses .bash_profile for login shells
      if [ "$(detect_platform)" = "macos" ] && [ -f "$HOME/.bash_profile" ]; then
        echo "$HOME/.bash_profile"
      elif [ -f "$HOME/.bashrc" ]; then
        echo "$HOME/.bashrc"
      else
        echo "$HOME/.bash_profile"
      fi
      ;;
    fish)
      echo "$HOME/.config/fish/config.fish"
      ;;
    *)
      # Default to .profile for unknown shells
      echo "$HOME/.profile"
      ;;
  esac
}

# Add ~/.local/bin to PATH in shell profile if not already present
add_path_to_profile() {
  local profile_file
  local path_export='export PATH="$HOME/.local/bin:$PATH"'
  local path_pattern='\.local/bin'
  
  profile_file=$(detect_shell_profile)
  
  # For fish shell, use different syntax
  if [[ "$profile_file" == *"fish"* ]]; then
    path_export='set -gx PATH $HOME/.local/bin $PATH'
    path_pattern='\.local/bin'
  fi
  
  log_info "Checking PATH configuration in $profile_file..."
  
  # Create profile file if it doesn't exist
  if [ ! -f "$profile_file" ]; then
    log_info "Creating $profile_file..."
    touch "$profile_file"
  fi
  
  # Check if ~/.local/bin is already in the profile
  if grep -q "$path_pattern" "$profile_file" 2>/dev/null; then
    log_success "PATH already includes ~/.local/bin"
    return 0
  fi
  
  # Add the PATH export to the profile
  log_info "Adding ~/.local/bin to PATH in $profile_file..."
  echo "" >> "$profile_file"
  echo "# Added by Superpowers installer" >> "$profile_file"
  echo "$path_export" >> "$profile_file"
  
  log_success "Added ~/.local/bin to PATH in $profile_file"
  log_warning "Please restart your terminal or run: source $profile_file"
}

# Check requirements
check_requirements() {
  log_info "Checking requirements..."
  
  local missing_deps=()
  
  if ! command -v git &> /dev/null; then
    missing_deps+=("git")
  fi
  
  if ! command -v node &> /dev/null; then
    missing_deps+=("node")
  fi
  
  if ! command -v npm &> /dev/null; then
    missing_deps+=("npm")
  fi
  
  if [ ${#missing_deps[@]} -gt 0 ]; then
    log_error "Missing required dependencies: ${missing_deps[*]}"
    echo ""
    echo "Please install the missing dependencies:"
    for dep in "${missing_deps[@]}"; do
      echo "  - $dep"
    done
    echo ""
    echo "Installation instructions:"
    echo "  macOS:   brew install git node"
    echo "  Linux:   apt-get install git nodejs npm  (or equivalent)"
    echo "  Windows: Download from https://git-scm.com and https://nodejs.org"
    exit 1
  fi
  
  log_success "All requirements met"
}

# Install or update Superpowers
install_superpowers() {
  if [ -d "$INSTALL_DIR/.git" ]; then
    log_info "Superpowers already installed, updating..."
    cd "$INSTALL_DIR"
    
    # Stash any local changes
    if ! git diff-index --quiet HEAD --; then
      log_warning "Local changes detected, stashing..."
      git stash save "Auto-stash before update $(date +%Y-%m-%d-%H%M%S)"
    fi
    
    # Pull latest changes
    if git pull origin main; then
      log_success "Updated to latest version"
    else
      log_error "Failed to update repository"
      exit 1
    fi
  else
    log_info "Installing Superpowers to $INSTALL_DIR..."
    
    # Create parent directory if needed
    mkdir -p "$(dirname "$INSTALL_DIR")"
    
    # Clone repository
    if git clone "$REPO_URL" "$INSTALL_DIR"; then
      log_success "Cloned repository"
    else
      log_error "Failed to clone repository"
      exit 1
    fi
    
    cd "$INSTALL_DIR"
  fi
}

# Run bootstrap
run_bootstrap() {
  log_info "Running bootstrap (this may take a moment)..."
  
  if "$INSTALL_DIR/.agents/superpowers-agent" bootstrap; then
    log_success "Bootstrap completed"
    touch "$INSTALL_DIR/.install_success"
  else
    log_error "Bootstrap failed"
    exit 1
  fi
}

# Update project instruction files
update_project_files() {
  # Only offer if we're in a different directory than the install location
  if [ "$PWD" = "$INSTALL_DIR" ]; then
    return 0
  fi
  
  # Check if any instruction files exist in current directory
  local files_to_update=()
  [ -f "AGENTS.md" ] && files_to_update+=("AGENTS.md")
  [ -f "CLAUDE.md" ] && files_to_update+=("CLAUDE.md")
  [ -f "GEMINI.md" ] && files_to_update+=("GEMINI.md")
  
  if [ ${#files_to_update[@]} -eq 0 ]; then
    return 0
  fi
  
  echo ""
  log_info "Found instruction files in current directory:"
  for file in "${files_to_update[@]}"; do
    echo "  - $file"
  done
  echo ""
  
  read -p "Would you like to update these files to point to the global Superpowers installation? (y/N) " -n 1 -r
  echo ""
  
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    for file in "${files_to_update[@]}"; do
      log_info "Updating $file..."
      
      # Create backup
      cp "$file" "${file}${BACKUP_SUFFIX}"
      log_info "Backup created: ${file}${BACKUP_SUFFIX}"
      
      # Copy from global installation
      if cp "$INSTALL_DIR/$file" "$file"; then
        log_success "Updated $file"
      else
        log_warning "Failed to update $file, restoring backup..."
        mv "${file}${BACKUP_SUFFIX}" "$file"
      fi
    done
  else
    log_info "Skipped project file updates"
  fi
}

# Main installation flow
main() {
  local platform
  platform=$(detect_platform)
  
  echo ""
  echo "╔═══════════════════════════════════════╗"
  echo "║   Superpowers Installation Script    ║"
  echo "╔═══════════════════════════════════════╝"
  echo ""
  log_info "Platform: $platform"
  log_info "Install location: $INSTALL_DIR"
  echo ""
  
  # Phase 1: Preflight checks
  check_requirements
  echo ""
  
  # Phase 2: Installation
  install_superpowers
  run_bootstrap
  echo ""
  
  # Phase 2.5: Ensure PATH includes ~/.local/bin
  add_path_to_profile
  echo ""
  
  # Phase 3: Project integration (optional)
  update_project_files
  echo ""
  
  # Success message
  log_success "Installation complete!"
  echo ""
  echo "Get started with:"
  echo "  ${GREEN}superpowers --help${NC}"
  echo "  ${GREEN}superpowers find-skills${NC}"
  echo ""
  echo "For more information:"
  echo "  https://github.com/complexthings/superpowers"
  echo ""
}

# Run main
main "$@"
