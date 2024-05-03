using _5InARow.Helper;
using _5InARow.Model;
using Microsoft.AspNetCore.SignalR;

namespace _5InARow.Hubs;

public class GameHub : Hub
{
    private static readonly List<Group> groups = [];
    private static readonly List<Client> clients = [];

    public async Task RemoveFromGroup(string groupName)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        await Clients.Group(groupName).SendAsync("Send", $"{Context.ConnectionId} has left the group {groupName}.");
    }

    public async Task GetGroups()
    {
        var filteredGroups = groups.FindAll(group => group.Clients.Count() < 2);
        await Clients.All.SendAsync("GetGroups", filteredGroups.ToArray());
    }

    public async Task RegisterClient(string username)
    {
        Client? client = clients.Find(x => x.ConnectionId == Context.ConnectionId);
        if (client == null)
        {
            client = new Client { ConnectionId = Context.ConnectionId, Username = username };
            clients.Add(client);
        }
        client.Username = username;
        await Clients.Caller.SendAsync("clientJoined", username);
    }

    public async Task RegisterGroup(string groupName)
    {
        //registerd user
        Client? client = clients.Find(x => x.ConnectionId == Context.ConnectionId);
        //registerd groups
        Group? group = groups.Find(x => x.GroupName == groupName);
        //Create new Group if group dont exist and user exist
        if (group == null)
        {
            if (client != null)
            {
                group = new() { GroupName = groupName };
                group.Clients.Add(client);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
                groups.Add(group);
            }
        }
        //Add existing user to existing group, if he isnt already in it
        else
        {
            var userInGroup = group.Clients.Find(x => x.ConnectionId == Context.ConnectionId);
            if (client != null && userInGroup == null)
            {
                group.Clients.Add(client);
                await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            }
        }
        await GetGroups();
    }

    public async Task StartGame(string groupname)
    {
        Group? group = groups.Find(x => x.GroupName == groupname);
        if (group != null && group.Clients.Count() == 2)
        {
            await Clients.All.SendAsync("BoardInit", group.Board);
        }
        else
        {
            await Clients.All.SendAsync("NotEnoughPLayer");
        }
    }

    public async Task PlacePiece(int x_boardField, int y_boardField, string groupName)
    {
        Group? group = groups.SingleOrDefault(x => x.GroupName == groupName);
        if (group != null)
        {
            var player1 = group.Clients[0].ConnectionId == Context.ConnectionId;
            var player2 = group.Clients[1].ConnectionId == Context.ConnectionId;
            if (player1 && group.Player1Turn)
            {
                group.Board[y_boardField, x_boardField] = "X";
                group.Player1Turn = !group.Player1Turn;
                await Clients.All.SendAsync("PiecePlaced", group.Board, group.Player1Turn);
                if (CalcWinner(group)) await Clients.All.SendAsync($"Winner", group.Clients[0].Username);
            }
            if (!(!player2 || group.Player1Turn))
            {
                group.Board[y_boardField, x_boardField] = "O";
                group.Player1Turn = !group.Player1Turn;
                await Clients.All.SendAsync("PiecePlaced", group.Board, group.Player1Turn);
                if (CalcWinner(group)) await Clients.All.SendAsync($"Winner", group.Clients[1].Username);
            }
        }
    }
    private bool CalcWinner(Group group)
    {
        var x = new CustomArray<string>();
        //Check row
        if (Check(group.Board, x.GetRow))
        {
            return true;
        }
        // Check columns
        if (Check(group.Board, x.GetColumn))
        {
            return true;
        }

        for (var i = 0; i < group.Board.GetLength(0); i++)
        {
            for (var j = 0; j < group.Board.GetLength(1); j++)
            {

                if (group.Board[i,j] == null)
                { continue; }
                else
                {
                    //Check right-left diagonal
                    if (CheckLRDiagonal(group.Board, j, i)) return true;
                    //Check left-right diagonal
                    if (CheckRLDiagonal(group.Board, j, i)) return true;
                }
            }
        }
        return false;
    }

    private bool Check(string[,] board, Func<string[,], int, string[]> check)
    {
        for (var i = 0; i < board.GetLength(0); i++)
        {
            for (var j = 0; j < board.GetLength(1) - 4; j++)
            {

                if (Check5inLine(check(board, i), 4, j))
                {
                    return true;
                }
            }
        }
        return false;
    }
    private bool Check5inLine(string[] row, int length, int start)
    {
        if (length == 0)
        {
            return true;
        }

        if (row[start] == row[start + length] && row[start] != null)
        {
            return Check5inLine(row, length - 1, start);
        }
        else
        {
            return false;
        }

    }
    private bool CheckLRDiagonal(string[,] board, int x, int y)
    {
        if (board.GetLength(0) - 4 < y)
        {
            return false;
        }
        if (board.GetLength(1) - 4 < x)
        {
            return false;
        }
        if (board[y, x] != null && board[y, x] == board[y + 1, x + 1] && board[y, x] == board[y + 2, x + 2] &&
            board[y, x] == board[y + 3, x + 3] && board[y, x] == board[y + 4, x + 4])
        {
            return true;
        }
        return false;
    }
    private bool CheckRLDiagonal(string[,] board, int x, int y)
    {
        if (y < 4 || y > board.GetLength(0))
        {
            return false;
        }
        if (x < 4 || board.GetLength(1) < x)
        {
            return false;
        }
        if (board[y, x] != null && board[y, x] == board[y + 1, x - 1] && board[y, x] == board[y + 2, x - 2] &&
            board[y, x] == board[y + 3, x - 3] && board[y, x] == board[y + 4, x - 4])
        {
            return true;
        }
        return false;
    }
}





