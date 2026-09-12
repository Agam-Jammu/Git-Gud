package com.gitgud.seed;

import com.gitgud.model.Question;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GitLinuxQuestions extends QuestionCategory {

    public static final String CATEGORY = "Git & Linux";

    @Override
    public String category() {
        return CATEGORY;
    }

    @Override
    public List<Question> questions() {
        return List.of(
                questionWithSnippet(
                        "What does `git rebase` do to commit history?",
                        "git switch feature\n" +
                                "git rebase main",
                        List.of("Creates a merge commit",
                                "Replays commits onto a new base, rewriting their hashes",
                                "Deletes the commits",
                                "Only fast-forwards"),
                        1,
                        "Rebase replays your commits on top of another base, producing new commits and a linear history."),
                questionWithSnippet(
                        "What permissions does `chmod 755 file` grant?",
                        "chmod 755 deploy.sh",
                        List.of("rwx for owner, r-x for group and others",
                                "rwx for everyone",
                                "rw- for the owner only",
                                "r-x for owner, rwx for others"),
                        0,
                        "7 = rwx (owner), 5 = r-x (group), 5 = r-x (others)."),
                question(
                        "Which Unix signal cannot be caught, blocked or ignored?",
                        List.of("SIGTERM (15)", "SIGINT (2)", "SIGKILL (9)", "SIGHUP (1)"),
                        2,
                        "SIGKILL is handled by the kernel and cannot be trapped by the process."),
                questionWithSnippet(
                        "What does `git reset --hard HEAD~1` do?",
                        "git reset --hard HEAD~1",
                        List.of("Moves HEAD back one commit and discards working tree changes",
                                "Creates a revert commit",
                                "Only unstages files",
                                "Deletes the remote branch"),
                        0,
                        "--hard moves the branch pointer and resets both index and working tree to that commit."),
                question(
                        "`git stash` is used to...",
                        List.of("Permanently delete local changes",
                                "Temporarily shelve uncommitted changes",
                                "Create a new branch",
                                "Push commits to a remote"),
                        1,
                        "Stash saves uncommitted work on a stack so you can restore it later with `git stash pop`."),
                question(
                        "Which command recursively searches files for a text pattern?",
                        List.of("grep -r", "ls -R", "find -name", "cat -r"),
                        0,
                        "`grep -r <pattern> <dir>` walks the directory tree searching file contents."),
                question(
                        "`git cherry-pick <sha>` applies...",
                        List.of("A single commit onto the current branch",
                                "A full merge of two branches",
                                "A deletion of the commit",
                                "A rebase of every commit"),
                        0,
                        "Cherry-pick copies the changes of one commit and commits them on the current branch."),
                question(
                        "Which command shows running processes and their resource usage?",
                        List.of("top", "df", "du", "stat"),
                        0,
                        "`top` (or `htop`) lists processes with live CPU and memory usage."),
                question(
                        "How do you create a symbolic link?",
                        List.of("ln -s target link", "ln target link", "cp -s target link", "link target link"),
                        0,
                        "`ln -s` creates a symbolic link; without -s it creates a hard link."),
                question(
                        "In Unix, what does exit code 0 indicate?",
                        List.of("Failure", "Success", "A signal was received", "The process was killed"),
                        1,
                        "Zero means success; any non-zero value indicates an error or abnormal termination.")
        );
    }
}
